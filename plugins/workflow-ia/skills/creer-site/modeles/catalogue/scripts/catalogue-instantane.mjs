// Avant chaque build (script « prebuild ») : copie le catalogue du Google Sheet dans src/data/catalogue.json.
// Le site affiche cet instantané même sans JavaScript, puis l'actualise via /api/catalogue.
// Si le tableau est injoignable, l'instantané précédent est gardé : le build ne casse jamais à cause du tableau.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { catalogueDepuisCsv, urlCatalogueValide } from "../src/lib/catalogue-csv.mjs";
import { CATALOGUE_CSV_URL } from "../catalogue.config.mjs";

const fichier = new URL("../src/data/catalogue.json", import.meta.url);
const url = CATALOGUE_CSV_URL;
mkdirSync(new URL("../src/data/", import.meta.url), { recursive: true });
if (!urlCatalogueValide(url)) {
  console.log("catalogue : adresse du tableau absente ou invalide (catalogue.config.mjs), instantané existant conservé");
  if (!existsSync(fichier)) writeFileSync(fichier, JSON.stringify({ articles: [] }, null, 2));
  process.exit(0);
}
try {
  const r = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const { articles, erreurs } = catalogueDepuisCsv(await r.text());
  for (const e of erreurs) console.log(`catalogue : ${e}`);
  writeFileSync(fichier, JSON.stringify({ articles, mis_a_jour: new Date().toISOString() }, null, 2));
  console.log(`catalogue : ${articles.length} articles`);
} catch (e) {
  console.log(`catalogue : tableau injoignable (${e.message}), instantané existant conservé`);
  if (!existsSync(fichier)) writeFileSync(fichier, JSON.stringify({ articles: [] }, null, 2));
}
