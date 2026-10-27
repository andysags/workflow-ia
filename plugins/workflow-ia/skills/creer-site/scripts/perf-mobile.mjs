#!/usr/bin/env node
// Mesure Lighthouse sur mobile ralenti (simulation 4G lente, téléphone milieu de gamme).
// Usage : node perf-mobile.mjs <url-de-base> <dossier-de-sortie> [route ...]
// Exemple : node perf-mobile.mjs http://localhost:4321 sites/mon-site/.qa / /menu /reservation
// Écrit <sortie>/lighthouse-<route>.json et <sortie>/mesures.json, puis affiche un résumé.
// Dernière ligne : "PERF: OK" ou "PERF: ECHEC <détails>". Code de sortie 0 dans les deux cas,
// 2 si la mesure n'a pas pu être faite.

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

const SEUILS = {
  performance: 90,
  accessibility: 95,
  "best-practices": 90,
  seo: 95,
  lcp_ms: 2500,
  cls: 0.1,
  tbt_ms: 200,
};

const [base, sortie, ...routesArg] = process.argv.slice(2);
if (!base || !sortie) {
  console.error("Usage : node perf-mobile.mjs <url-de-base> <dossier-de-sortie> [route ...]");
  process.exit(2);
}
const routes = routesArg.length ? routesArg : ["/"];
mkdirSync(sortie, { recursive: true });

function trouverChrome() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  for (const dossier of [process.cwd(), join(process.cwd(), "site")]) {
    try {
      const require = createRequire(join(dossier, "package.json"));
      const chemin = require("playwright").chromium.executablePath();
      if (existsSync(chemin)) return chemin;
    } catch {}
  }
  // Sinon, chrome-launcher (utilisé par Lighthouse) cherche Chrome ou Chromium installé.
  return undefined;
}

const chrome = trouverChrome();
const env = { ...process.env, ...(chrome ? { CHROME_PATH: chrome } : {}) };
const pages = [];

function mesurer(url, fichier) {
  const res = spawnSync(
    "npx",
    [
      "-y", "lighthouse@13", url,
      "--quiet",
      "--form-factor=mobile",
      "--throttling-method=simulate",
      "--only-categories=performance,accessibility,best-practices,seo",
      "--output=json", `--output-path=${fichier}`,
      "--chrome-flags=--headless=new --no-sandbox --disable-gpu",
    ],
    { env, encoding: "utf8", shell: process.platform === "win32", timeout: 180_000 },
  );
  if (!existsSync(fichier)) return { erreur: (res.stderr || res.error?.message || "échec inconnu").slice(-500) };
  const lhr = JSON.parse(readFileSync(fichier, "utf8"));
  // Lighthouse écrit un rapport même quand la page ne charge pas (404, erreur réseau).
  if (lhr.runtimeError) return { erreur: `${lhr.runtimeError.code} : ${lhr.runtimeError.message}`.slice(0, 300) };
  return { lhr };
}

for (const route of routes) {
  const nom = route === "/" ? "accueil" : route.replace(/^\/|\/$/g, "").replace(/[^a-z0-9]+/gi, "-");
  const fichier = join(sortie, `lighthouse-${nom}.json`);
  let mesure = mesurer(new URL(route, base).href, fichier);
  // Les sites statiques servent souvent /page/ et non /page : on réessaie avec la barre finale.
  if (mesure.erreur && !route.endsWith("/")) mesure = mesurer(new URL(`${route}/`, base).href, fichier);
  if (mesure.erreur) {
    pages.push({ route, erreur: mesure.erreur });
    continue;
  }
  const { lhr } = mesure;
  const score = (c) => Math.round((lhr.categories[c]?.score ?? 0) * 100);
  const audit = (a) => lhr.audits[a]?.numericValue ?? null;
  pages.push({
    route,
    performance: score("performance"),
    accessibility: score("accessibility"),
    "best-practices": score("best-practices"),
    seo: score("seo"),
    lcp_ms: Math.round(audit("largest-contentful-paint")),
    cls: Number((audit("cumulative-layout-shift") ?? 0).toFixed(3)),
    tbt_ms: Math.round(audit("total-blocking-time")),
    poids_ko: Math.round((audit("total-byte-weight") ?? 0) / 1024),
    // Une page volontairement exclue des moteurs (404, confirmation) a un SEO bas par conception.
    noindex: lhr.audits["is-crawlable"]?.score === 0,
  });
}

const echecs = [];
for (const p of pages) {
  if (p.erreur) { echecs.push(`${p.route}: mesure impossible`); continue; }
  for (const c of ["performance", "accessibility", "best-practices", "seo"]) {
    if (c === "seo" && p.noindex) continue;
    if (p[c] < SEUILS[c]) echecs.push(`${p.route}: ${c} ${p[c]} < ${SEUILS[c]}`);
  }
  if (p.lcp_ms > SEUILS.lcp_ms) echecs.push(`${p.route}: LCP ${p.lcp_ms} ms > ${SEUILS.lcp_ms}`);
  if (p.cls > SEUILS.cls) echecs.push(`${p.route}: CLS ${p.cls} > ${SEUILS.cls}`);
  if (p.tbt_ms > SEUILS.tbt_ms) echecs.push(`${p.route}: TBT ${p.tbt_ms} ms > ${SEUILS.tbt_ms}`);
}

const resultat = {
  date: new Date().toISOString(),
  profil: "mobile, réseau 4G lent simulé, CPU ralenti x4 (défauts Lighthouse)",
  seuils: SEUILS,
  pages,
  verdict: echecs.length ? "ECHEC" : "OK",
  echecs,
};
writeFileSync(join(sortie, "mesures.json"), JSON.stringify(resultat, null, 2));

console.log("route | perf | a11y | bonnes pratiques | seo | LCP ms | CLS | TBT ms | poids Ko");
for (const p of pages) {
  console.log(p.erreur
    ? `${p.route} | ERREUR : ${p.erreur.split("\n").pop()}`
    : `${p.route} | ${p.performance} | ${p.accessibility} | ${p["best-practices"]} | ${p.seo}${p.noindex ? " (noindex)" : ""} | ${p.lcp_ms} | ${p.cls} | ${p.tbt_ms} | ${p.poids_ko}`);
}
if (pages.every((p) => p.erreur)) {
  console.log("PERF: IMPOSSIBLE aucune page mesurée (Chrome introuvable ? définir CHROME_PATH)");
  process.exit(2);
}
console.log(echecs.length ? `PERF: ECHEC ${echecs.join(" ; ")}` : "PERF: OK");
