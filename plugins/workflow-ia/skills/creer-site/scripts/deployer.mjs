#!/usr/bin/env node
// Déploie le site d'un projet workflow-ia sur Netlify, en une seule commande simple.
// Usage : node deployer.mjs <dossier-projet> [--site <site_id>] [--nom <nom-netlify>] [--prod] [--sans-build]
//
// Étapes : jeton présent → build → contrôle du dossier publié (site/dist) → création du site si besoin
// → envoi de site/dist uniquement → vérification HTTP de l'URL.
// Le jeton (NETLIFY_AUTH_TOKEN) n'est jamais affiché. Dernière ligne :
//   DEPLOIEMENT: OK <url> SITE_ID: <id> MODE: brouillon|production
//   DEPLOIEMENT: EN_ATTENTE <raison>

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const args = process.argv.slice(2);
const projet = args[0] && !args[0].startsWith("--") ? resolve(args[0]) : null;
const option = (nom) => { const i = args.indexOf(nom); return i >= 0 ? args[i + 1] : undefined; };
const prod = args.includes("--prod");
const sansBuild = args.includes("--sans-build");

function fin(ligne, code = 0) { console.log(ligne); process.exit(code); }
function attente(raison) { fin(`DEPLOIEMENT: EN_ATTENTE ${raison}`); }

if (!projet) { console.error("Usage : node deployer.mjs <dossier-projet> [--site <id>] [--nom <nom>] [--prod]"); process.exit(2); }
const site = join(projet, "site");
const dist = join(site, "dist");
if (!existsSync(join(site, "package.json"))) attente(`aucun site à déployer dans ${site}`);
if (!process.env.NETLIFY_AUTH_TOKEN) {
  attente("jeton Netlify absent : créer un jeton (Netlify > User settings > Applications > Personal access tokens) " +
    "et le définir dans la variable d'environnement NETLIFY_AUTH_TOKEN, puis relancer.");
}

function lancer(cmd, cmdArgs, { cwd = projet, json = false } = {}) {
  const res = spawnSync(cmd, cmdArgs, { cwd, encoding: "utf8", shell: process.platform === "win32", env: process.env, maxBuffer: 64 * 1024 * 1024 });
  const sortie = `${res.stdout ?? ""}${res.stderr ?? ""}`;
  if (res.status !== 0) return { ok: false, sortie };
  if (!json) return { ok: true, sortie };
  // La CLI peut écrire des avertissements avant le JSON : on garde le dernier objet JSON complet.
  const debut = res.stdout.indexOf("{");
  try { return { ok: true, data: JSON.parse(res.stdout.slice(debut)) }; } catch { return { ok: false, sortie }; }
}
const netlify = (...a) => ["--yes", "netlify-cli@latest", ...a];

// 1. Build
if (!sansBuild) {
  console.log("1/5 Build du site…");
  const b = lancer("npm", ["run", "build", "--prefix", site]);
  if (!b.ok) attente(`le build échoue : ${b.sortie.trim().split("\n").slice(-5).join(" | ")}`);
}

// 2. Contrôle du dossier publié (mêmes règles que le hook garde-deploiement)
console.log("2/5 Contrôle du dossier publié…");
if (!existsSync(join(dist, "index.html"))) attente(`${dist} ne contient pas index.html`);
let nombre = 0;
const interdit = (n) => n.endsWith(".jsonl") || /^\d\d-.*\.md$/.test(n) || n === "etat.json" ||
  n === ".env" || n.startsWith(".env.") || n === ".git" || n === "node_modules";
(function parcourir(d) {
  for (const n of readdirSync(d)) {
    if (interdit(n)) attente(`fichier interne dans le dossier publié : ${join(d, n)}`);
    const c = join(d, n);
    if (statSync(c).isDirectory()) parcourir(c); else nombre++;
  }
})(dist);
if (nombre > 2000) attente(`${nombre} fichiers dans ${dist} : ce n'est probablement pas le bon dossier`);
console.log(`    ${nombre} fichiers à publier.`);

// 3. Site Netlify
let siteId = option("--site");
if (!siteId) {
  const nom = option("--nom") ?? basename(projet).toLowerCase().replace(/[^a-z0-9-]/g, "-");
  console.log(`3/5 Création du site Netlify « ${nom} »…`);
  const c = lancer("npx", netlify("api", "createSite", "--data", JSON.stringify({ body: { name: nom } })), { json: true });
  if (!c.ok || !c.data?.id) attente(`création du site impossible (nom déjà pris ?) : ${(c.sortie ?? "").trim().split("\n").slice(-3).join(" | ")}`);
  siteId = c.data.id;
} else {
  console.log(`3/5 Site existant ${siteId}.`);
}

// 4. Envoi de site/dist uniquement. La CLI est lancée depuis site/ pour lire son netlify.toml
// (en-têtes de sécurité, redirections) : lancée ailleurs, elle les ignore sans prévenir.
console.log(`4/5 Envoi (${prod ? "production" : "brouillon"})…`);
const d = lancer("npx", netlify("deploy", "--dir", dist, "--site", siteId, "--json",
  "--message", `workflow-ia ${new Date().toISOString().slice(0, 16)}`, ...(prod ? ["--prod"] : [])),
  { json: true, cwd: existsSync(join(site, "netlify.toml")) ? site : projet });
if (!d.ok) attente(`envoi refusé : ${(d.sortie ?? "").trim().split("\n").slice(-3).join(" | ")}`);
const url = prod ? (d.data.url ?? d.data.deploy_url) : d.data.deploy_url;

// 5. Vérification
console.log("5/5 Vérification de l'URL…");
let statut = 0;
for (let essai = 0; essai < 5 && statut !== 200; essai++) {
  try { statut = (await fetch(url, { redirect: "follow" })).status; } catch { statut = 0; }
  if (statut !== 200) await new Promise((r) => setTimeout(r, 3000));
}
if (statut !== 200) attente(`déployé (site ${siteId}) mais ${url} répond ${statut || "rien"}`);
fin(`DEPLOIEMENT: OK ${url} SITE_ID: ${siteId} MODE: ${prod ? "production" : "brouillon"}`);
