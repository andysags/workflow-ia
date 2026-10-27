#!/usr/bin/env node
// Relie un nom de domaine personnalisé à un site Netlify, et dit au client quoi régler chez son registraire.
//
// Usage :
//   node domaine.mjs --site <site_id> --domaine <exemple.bj>                 # associe le domaine, puis contrôle le DNS
//   node domaine.mjs --site <site_id> --domaine <exemple.bj> --verifier      # contrôle seulement (DNS, HTTPS)
//   node domaine.mjs --site <site_id> --domaine <exemple.bj> --simulation    # montre ce qui serait envoyé, sans rien changer
//
// Le domaine s'achète chez un registraire (pour .bj, .ci, .sn… : un registraire agréé du pays) : le script ne l'achète pas.
// Le jeton (NETLIFY_AUTH_TOKEN) n'est jamais affiché. Dernière ligne :
//   DOMAINE: OK https://<domaine>
//   DOMAINE: EN_ATTENTE_DNS <ce qu'il reste à faire>
//   DOMAINE: EN_ATTENTE <raison>

import { spawnSync } from "node:child_process";
import { promises as dns } from "node:dns";

// Valeurs publiées par Netlify (docs « Configure external DNS ») : à revérifier si Netlify les change.
const NETLIFY_APEX_ALIAS = "apex-loadbalancer.netlify.com";
const NETLIFY_APEX_IP = "75.2.60.5";
// Suffixes à deux niveaux courants : sous ces suffixes, « nom.com.sn » est un domaine racine.
const SUFFIXES_DOUBLES = ["com.sn", "org.sn", "gouv.sn", "co.ci", "or.ci", "com.ci", "gouv.ci", "gouv.bj", "co.cm", "com.cm",
  "gov.tg", "com.ng", "co.za", "co.uk", "com.fr"];

const args = process.argv.slice(2);
const option = (nom) => { const i = args.indexOf(nom); return i >= 0 ? args[i + 1] : undefined; };
const verifierSeulement = args.includes("--verifier");
const simulation = args.includes("--simulation");

function fin(ligne, code = 0) { console.log(ligne); process.exit(code); }
function attente(raison) { fin(`DOMAINE: EN_ATTENTE ${raison}`); }

const siteId = option("--site");
const brut = option("--domaine");
if (!siteId || !brut) { console.error("Usage : node domaine.mjs --site <site_id> --domaine <exemple.bj> [--verifier|--simulation]"); process.exit(2); }

const domaine = brut.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/\.$/, "");
if (!/^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(domaine)) attente(`« ${brut} » n'est pas un nom de domaine valide`);
const etiquettes = domaine.split(".");
// Domaine racine (celui qu'on achète) : 2 étiquettes, ou 3 sous un suffixe double (nom.com.sn).
const nbRacine = SUFFIXES_DOUBLES.includes(etiquettes.slice(-2).join(".")) ? 3 : 2;
if (etiquettes.length < nbRacine) attente(`« ${domaine} » est un suffixe, pas un domaine`);
const apex = etiquettes.slice(-nbRacine).join(".");
const sousDomaine = etiquettes.slice(0, -nbRacine).join(".");   // "" pour le domaine racine
// Domaine racine ou www : les deux formes sont reliées (l'autre est redirigée par Netlify). Autre sous-domaine : lui seul.
const racineOuWww = sousDomaine === "" || sousDomaine === "www";
const principal = domaine;
const aliasVoulus = racineOuWww ? [sousDomaine === "" ? `www.${apex}` : apex] : [];

function netlify(...a) {
  const res = spawnSync("npx", ["--yes", "netlify-cli@latest", "api", ...a], { encoding: "utf8", env: process.env, shell: process.platform === "win32", maxBuffer: 16 * 1024 * 1024 });
  const sortie = `${res.stdout ?? ""}\n${res.stderr ?? ""}`;
  if (res.status !== 0) return { ok: false, sortie };
  try { return { ok: true, data: JSON.parse(res.stdout.slice(res.stdout.indexOf("{"))) }; } catch { return { ok: false, sortie }; }
}

if (!simulation && !process.env.NETLIFY_AUTH_TOKEN)
  attente("jeton Netlify absent : créez-le (User settings → Applications → Personal access tokens), définissez NETLIFY_AUTH_TOKEN, puis relancez");

// 1. Site Netlify
let nomNetlify = "<votre-site>";
let site = null;
if (!simulation) {
  const s = netlify("getSite", "--data", JSON.stringify({ site_id: siteId }));
  if (!s.ok) attente(`site ${siteId} introuvable sur ce compte Netlify`);
  site = s.data;
  nomNetlify = site.name;
}
const cible = `${nomNetlify}.netlify.app`;

// 2. Association du domaine (principal = la forme donnée par le client)
if (!verifierSeulement) {
  const existants = site?.domain_aliases ?? [];
  // L'API remplace toute la liste des alias : on garde ceux qui existent déjà.
  const alias = [...new Set([...existants, ...aliasVoulus])].filter((a) => a !== principal);
  const corps = { site_id: siteId, body: { custom_domain: principal, domain_aliases: alias } };
  if (simulation) {
    console.log(`Simulation : updateSite ${JSON.stringify(corps)}`);
  } else if (site.custom_domain === principal && aliasVoulus.every((a) => existants.includes(a))) {
    console.log(`1/3 Domaine déjà associé : ${principal}`);
  } else {
    if (site.custom_domain && site.custom_domain !== principal)
      attente(`le site a déjà le domaine ${site.custom_domain} : changez-le d'abord dans Netlify (Domain management) si c'est voulu`);
    console.log(`1/3 Association de ${principal}${alias.length ? ` (+ ${alias.join(", ")})` : ""} au site ${nomNetlify}…`);
    const u = netlify("updateSite", "--data", JSON.stringify(corps));
    if (!u.ok) attente(`Netlify refuse le domaine (déjà utilisé par un autre site ?) : ${u.sortie.trim().split("\n").slice(-2).join(" | ")}`);
  }
}

// 3. Enregistrements DNS à créer chez le registraire
const lignes = racineOuWww
  ? [
      ["@ (ou vide)", "ALIAS / ANAME / CNAME aplati", NETLIFY_APEX_ALIAS, `si votre registraire ne le propose pas : un enregistrement A vers ${NETLIFY_APEX_IP}`],
      ["www", "CNAME", cible, ""],
    ]
  : [[sousDomaine, "CNAME", cible, `sous-domaine de ${apex}`]];
console.log("\n2/3 À créer chez le registraire du domaine (zone DNS) :");
console.log("| Nom | Type | Valeur | Remarque |\n|---|---|---|---|");
for (const l of lignes) console.log(`| ${l.join(" | ")} |`);
console.log("Supprimez les anciens enregistrements A, AAAA ou CNAME de ces mêmes noms. Ne touchez pas aux enregistrements MX (e-mails) ni TXT.");
if (simulation) fin("DOMAINE: EN_ATTENTE_DNS simulation : rien n'a été modifié");

// 4. Contrôle DNS
console.log("\n3/3 Contrôle du DNS…");
// Les adresses de Netlify varient selon la région et les résolveurs aplatissent souvent les CNAME : on demande donc
// directement au serveur qui répond s'il est Netlify (en-têtes « server: Netlify » ou « x-nf-request-id »).
async function pointeVersNetlify(nom) {
  try { await dns.lookup(nom); } catch (e) {
    return { ok: false, detail: e.code === "ENOTFOUND" || e.code === "ENODATA" ? "aucun enregistrement DNS" : e.code ?? String(e) };
  }
  try {
    const r = await fetch(`http://${nom}/`, { redirect: "manual", signal: AbortSignal.timeout(15000) });
    const serveur = r.headers.get("server") ?? "";
    if (/netlify/i.test(serveur) || r.headers.has("x-nf-request-id")) return { ok: true, detail: "répond depuis Netlify" };
    return { ok: false, detail: `répond depuis un autre hébergeur (${serveur || "serveur inconnu"})` };
  } catch (e) {
    return { ok: false, detail: `ne répond pas (${e.cause?.code ?? e.name})` };
  }
}
const noms = racineOuWww ? [apex, `www.${apex}`] : [domaine];
const etats = [];
for (const n of noms) {
  const r = await pointeVersNetlify(n);
  etats.push({ n, ...r });
  console.log(`    ${r.ok ? "✅" : "❌"} ${n} : ${r.detail}`);
}
if (etats.some((e) => !e.ok))
  fin(`DOMAINE: EN_ATTENTE_DNS ${etats.filter((e) => !e.ok).map((e) => e.n).join(", ")} ne pointe pas encore vers Netlify : créez les enregistrements ci-dessus, puis relancez avec --verifier (la propagation peut prendre jusqu'à 48 h)`);

// 5. HTTPS : Netlify crée le certificat (Let's Encrypt) une fois le DNS vérifié
let statut = 0;
try { statut = (await fetch(`https://${principal}/`, { redirect: "follow" })).status; } catch { statut = 0; }
if (statut !== 200)
  fin(`DOMAINE: EN_ATTENTE_DNS DNS correct, HTTPS pas encore prêt (${statut || "erreur de certificat"}) : Netlify crée le certificat dans l'heure, sinon Domain management → HTTPS → Verify DNS configuration`);
fin(`DOMAINE: OK https://${principal}`);
