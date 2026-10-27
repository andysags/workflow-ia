#!/usr/bin/env node
// Lit les résultats d'un passage du banc d'essai et écrit rapport.md et rapport.json.
// Usage : node banc-essai/rapport.mjs <dossier-de-resultats>

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const racine = process.argv[2];
if (!racine || !existsSync(racine)) {
  console.error("Usage : node rapport.mjs <dossier-de-resultats>");
  process.exit(2);
}

const lire = (f) => (existsSync(f) ? readFileSync(f, "utf8") : "");
const json = (f) => { try { return JSON.parse(lire(f)); } catch { return null; } };

function fichiers(dossier, filtre, acc = []) {
  if (!existsSync(dossier)) return acc;
  for (const nom of readdirSync(dossier)) {
    if (nom === "node_modules" || nom === ".git") continue;
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) fichiers(chemin, filtre, acc);
    else if (filtre(chemin)) acc.push(chemin);
  }
  return acc;
}

// Cherche une ligne de verdict du type "Verdict : X" ou "Décision : X" dans un livrable.
// Les agents ajoutent une section par itération : le verdict qui compte est le dernier du fichier.
function verdict(fichier, motif = /^##\s*(?:Verdict|Décision)\s*:\s*([A-Z_]+)/gm) {
  const m = [...lire(fichier).matchAll(motif)].pop();
  return m ? m[1] : null;
}

function analyserRun(fichier) {
  const res = { cout_usd: null, tours: null, sous_agents: {}, erreurs: 0, fin: null, poids: {}, appels: {} };
  const agentDe = {}; // identifiant de l'appel Agent -> type d'agent
  for (const ligne of lire(fichier).split("\n")) {
    if (!ligne) continue;
    let e;
    try { e = JSON.parse(ligne); } catch { continue; }
    if (e.type === "result") {
      res.cout_usd = e.total_cost_usd ?? res.cout_usd;
      res.tours = e.num_turns ?? res.tours;
      res.fin = e.subtype;
    }
    if (e.type === "assistant") {
      for (const c of e.message?.content ?? []) {
        if (c.type === "tool_use" && c.name === "Agent") {
          const a = (c.input?.subagent_type ?? "?").replace(/^workflow-ia:/, "");
          agentDe[c.id] = a;
          if (!e.parent_tool_use_id) res.sous_agents[a] = (res.sous_agents[a] ?? 0) + 1;
        }
      }
      // Poids relatif d'un appel modèle, en équivalent tokens d'entrée (tarifs relatifs Anthropic :
      // lecture de cache x0,1, écriture de cache x1,25, sortie x5).
      const u = e.message?.usage ?? {};
      const poids = (u.input_tokens ?? 0) + 0.1 * (u.cache_read_input_tokens ?? 0)
        + 1.25 * (u.cache_creation_input_tokens ?? 0) + 5 * (u.output_tokens ?? 0);
      const qui = e.parent_tool_use_id ? agentDe[e.parent_tool_use_id] ?? "?" : "orchestrateur";
      res.poids[qui] = (res.poids[qui] ?? 0) + poids;
      res.appels[qui] = (res.appels[qui] ?? 0) + 1;
    }
    if (e.type === "user") {
      for (const c of Array.isArray(e.message?.content) ? e.message.content : []) {
        if (c.type === "tool_result" && c.is_error) res.erreurs++;
      }
    }
  }
  return res;
}

const lignes = [];
for (const cas of readdirSync(racine).sort()) {
  const dossierCas = join(racine, cas);
  if (!statSync(dossierCas).isDirectory()) continue;
  const sites = join(dossierCas, "sites");
  const slug = existsSync(sites) ? readdirSync(sites)[0] : null;
  const projet = slug ? join(sites, slug) : null;
  const etat = projet ? json(join(projet, "etat.json")) : null;
  const dist = projet ? join(projet, "site", "dist") : null;
  const html = dist ? fichiers(dist, (f) => f.endsWith(".html")) : [];
  const aCompleter = html.reduce((n, f) => n + (lire(f).match(/À COMPLÉTER/g) ?? []).length, 0);
  // Liens de contact (pack Afrique) : wa.me avec un numéro en chiffres seuls, tel: au format international.
  const liens = html.flatMap((f) => [...lire(f).matchAll(/href="((?:https:\/\/wa\.me|tel:)[^"]*)"/g)].map((m) => m[1].replaceAll("&amp;", "&")));
  const lienValide = (l) => {
    if (l.startsWith("tel:")) return /^tel:\+\d{6,15}$/.test(l);
    const m = l.match(/^https:\/\/wa\.me\/(\d{6,15})(\?text=([^&]*))?$/);
    if (!m) return false;
    try { if (m[3] !== undefined) decodeURIComponent(m[3]); return true; } catch { return false; }
  };
  const liensInvalides = [...new Set(liens.filter((l) => !lienValide(l)))];
  // Mesure de performance : celle du vérificateur si elle existe, sinon la dernière de la QA.
  const perf = projet
    ? json(join(projet, ".qa", "verification", "mesures.json")) ?? json(join(projet, ".qa", "perf", "mesures.json"))
    : null;
  const min = (cle) => (perf?.pages?.length ? Math.min(...perf.pages.filter((p) => !p.erreur).map((p) => p[cle])) : null);
  const max = (cle) => (perf?.pages?.length ? Math.max(...perf.pages.filter((p) => !p.erreur).map((p) => p[cle])) : null);
  const run = analyserRun(join(dossierCas, "run.jsonl"));

  lignes.push({
    cas,
    slug,
    etape: etat?.etape ?? null,
    statut: etat?.statut ?? null,
    build: html.length > 0,
    pages: html.length,
    qa: projet ? verdict(join(projet, "07-rapport-qa.md")) : null,
    securite: projet ? verdict(join(projet, "08-rapport-securite.md")) : null,
    critique: projet ? verdict(join(projet, "10-revue-critique.md")) ?? verdict(join(projet, ".qa", "critique", "10-revue-critique.md")) : null,
    verification: projet ? verdict(join(projet, "11-verification.md")) : null,
    iterations_qa: etat?.iterations_qa ?? null,
    iterations_securite: etat?.iterations_securite ?? null,
    perf: perf?.verdict ?? null,
    perf_min: min("performance"),
    a11y_min: min("accessibility"),
    seo_min: min("seo"),
    lcp_max_ms: max("lcp_ms"),
    a_completer: aCompleter,
    liens_contact: liens.length,
    liens_invalides: liensInvalides,
    decisions_auto: etat?.decisions_auto?.length ?? null,
    cout_usd: run.cout_usd != null ? Number(run.cout_usd.toFixed(2)) : null,
    duree_min: Number(((Number(lire(join(dossierCas, "duree_s"))) || 0) / 60).toFixed(1)),
    sous_agents: run.sous_agents,
    erreurs_outils: run.erreurs,
    poids_agents: run.poids,
    appels_agents: run.appels,
    fin: run.fin,
  });
}

const ok = (v, bons) => (v == null ? "—" : bons.includes(v) ? `✅ ${v}` : `❌ ${v}`);
const total = (cle) => lignes.reduce((s, l) => s + (l[cle] ?? 0), 0);
const md = [
  `# Banc d'essai workflow-ia : ${racine.split("/").pop()}`,
  "",
  `${lignes.length} cas · build OK : ${lignes.filter((l) => l.build).length}/${lignes.length} · ` +
    `revue finale OK : ${lignes.filter((l) => l.critique === "PASS" && l.verification === "PRET").length}/${lignes.length} · ` +
    `coût total : ${total("cout_usd").toFixed(2)} $ · durée totale : ${total("duree_min").toFixed(0)} min`,
  "",
  "| Cas | Build | Pages | QA (itér.) | Sécurité | Critique | Vérif. | Perf mobile | Perf min | A11y min | SEO min | LCP max | À compléter | Contacts | Coût $ | Durée min |",
  "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|",
  ...lignes.map((l) => [
    l.cas, l.build ? "✅" : "❌", l.pages,
    `${ok(l.qa, ["VALIDE"])} (${l.iterations_qa ?? "?"})`, ok(l.securite, ["AUTORISE"]),
    ok(l.critique, ["PASS"]), ok(l.verification, ["PRET"]), ok(l.perf, ["OK"]),
    l.perf_min ?? "—", l.a11y_min ?? "—", l.seo_min ?? "—", l.lcp_max_ms ?? "—",
    l.a_completer, l.liens_contact ? (l.liens_invalides.length ? `❌ ${l.liens_invalides.length}/${l.liens_contact}` : `✅ ${l.liens_contact}`) : "—",
    l.cout_usd ?? "—", l.duree_min,
  ].join(" | ").replace(/^/, "| ").replace(/$/, " |")),
  "",
  "## Consommation par agent (tous cas confondus)",
  "",
  "| Agent | Appels modèle | Part de la consommation |",
  "|---|---|---|",
  ...(() => {
    const poids = {}, appels = {};
    for (const l of lignes) for (const [a, p] of Object.entries(l.poids_agents ?? {})) {
      poids[a] = (poids[a] ?? 0) + p; appels[a] = (appels[a] ?? 0) + (l.appels_agents?.[a] ?? 0);
    }
    const tot = Object.values(poids).reduce((s, p) => s + p, 0) || 1;
    return Object.entries(poids).sort((x, y) => y[1] - x[1])
      .map(([a, p]) => `| ${a} | ${appels[a]} | ${(100 * p / tot).toFixed(1)} % |`);
  })(),
  "",
  "## Détail",
  "",
  ...lignes.map((l) => `- **${l.cas}** : étape \`${l.etape}\` (${l.statut}), agents lancés ${JSON.stringify(l.sous_agents)}, ` +
    `erreurs d'outils ${l.erreurs_outils}, décisions automatiques ${l.decisions_auto ?? "?"}, fin de session \`${l.fin}\`.`),
  "",
];
writeFileSync(join(racine, "rapport.md"), md.join("\n"));
writeFileSync(join(racine, "rapport.json"), JSON.stringify(lignes, null, 2));
console.log(md.join("\n"));
