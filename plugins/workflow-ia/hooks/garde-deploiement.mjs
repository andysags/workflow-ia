#!/usr/bin/env node
// Garde-fou de déploiement (hook PreToolUse sur Bash) du plugin workflow-ia.
//
// Bloque une commande `netlify deploy` (ou `netlify-cli deploy`, `ntl deploy`) qui risque de publier
// autre chose que le site :
//   - dans un projet workflow-ia, un déploiement sans `--dir` explicite (Netlify publierait alors le
//     dossier courant ou celui de sa configuration, comme lors de l'incident du festival) ;
//   - partout, un `--dir` qui n'existe pas, sans index.html, ou qui contient des fichiers internes
//     (journaux .jsonl, livrables 0X-*.md, etat.json, .env, .git, node_modules) ou trop de fichiers.
// Toute autre commande passe sans décision : le flux normal des permissions s'applique.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";

const MAX_FICHIERS = 2000;
const INTERDITS = [
  { test: (n) => n.endsWith(".jsonl"), raison: "journal .jsonl" },
  { test: (n) => /^\d\d-.*\.md$/.test(n), raison: "livrable de projet (0X-*.md)" },
  { test: (n) => n === "etat.json", raison: "etat.json du projet" },
  { test: (n) => n === ".env" || n.startsWith(".env."), raison: "fichier .env" },
  { test: (n) => n === ".git", raison: "dossier .git" },
  { test: (n) => n === "node_modules", raison: "node_modules" },
];

function refuser(raison) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: `Garde-fou de déploiement workflow-ia : ${raison} ` +
        "Construis le site, puis déploie uniquement le dossier publié avec " +
        "`npx netlify-cli deploy --dir <dossier-projet>/site/dist --site <site_id>` (voir l'agent devops).",
    },
  }));
  process.exit(0);
}

let entree;
try {
  entree = JSON.parse(readFileSync(0, "utf8"));
} catch {
  process.exit(0); // Entrée illisible : on ne bloque pas une commande à l'aveugle.
}
const commande = entree?.tool_input?.command ?? "";
if (!/\b(netlify(-cli)?(@[\w.-]+)?|ntl)\b[^;&|]*\bdeploy\b/.test(commande)) process.exit(0);

// Dossier de travail effectif : celui de la session, ou celui d'un `cd` placé avant la commande.
let cwd = entree.cwd || process.cwd();
const cd = commande.match(/(?:^|&&|;)\s*cd\s+("([^"]+)"|'([^']+)'|(\S+))\s*(?:&&|;)[^&;]*\bdeploy\b/);
if (cd) {
  const cible = cd[2] ?? cd[3] ?? cd[4];
  cwd = isAbsolute(cible) ? cible : resolve(cwd, cible);
}

function dansProjetWorkflow(dossier) {
  // Un dossier de projet workflow-ia (etat.json) ou un dossier qui en contient (sites/<slug>/etat.json).
  let d = resolve(dossier);
  for (;;) {
    if (existsSync(join(d, "etat.json"))) return true;
    const parent = dirname(d);
    if (parent === d) break;
    d = parent;
  }
  const sites = join(dossier, "sites");
  if (existsSync(sites)) {
    try {
      return readdirSync(sites).some((s) => existsSync(join(sites, s, "etat.json")));
    } catch {}
  }
  return false;
}

const dirArg = commande.match(/(?:--dir|-d)(?:=|\s+)("([^"]+)"|'([^']+)'|(\S+))/);
if (!dirArg) {
  if (dansProjetWorkflow(cwd)) refuser("déploiement sans `--dir` explicite dans un projet workflow-ia.");
  process.exit(0);
}

const brut = dirArg[2] ?? dirArg[3] ?? dirArg[4];
const dossier = isAbsolute(brut) ? brut : resolve(cwd, brut);
if (!existsSync(dossier) || !statSync(dossier).isDirectory()) {
  refuser(`le dossier à publier n'existe pas (${dossier}). Lance d'abord le build.`);
}
if (!existsSync(join(dossier, "index.html"))) {
  refuser(`le dossier à publier (${dossier}) ne contient pas index.html : ce n'est pas un site construit.`);
}

let nombre = 0;
function parcourir(d) {
  for (const nom of readdirSync(d)) {
    const interdit = INTERDITS.find((i) => i.test(nom));
    if (interdit) refuser(`le dossier à publier contient un élément interne (${interdit.raison} : ${join(d, nom)}).`);
    const chemin = join(d, nom);
    if (statSync(chemin).isDirectory()) parcourir(chemin);
    else if (++nombre > MAX_FICHIERS) refuser(`le dossier à publier contient plus de ${MAX_FICHIERS} fichiers : ce n'est probablement pas le bon dossier.`);
  }
}
parcourir(dossier);
process.exit(0);
