// Tests du modèle « catalogue Google Sheets » : node --test plugins/workflow-ia/skills/creer-site/scripts/tests/catalogue.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const modele = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "modeles", "catalogue");
const { catalogueDepuisCsv, lireCsv, urlCatalogueValide, recupererCsv, hoteRedirectionValide } = await import(join(modele, "src/lib/catalogue-csv.mjs"));
const URL_OK = "https://docs.google.com/spreadsheets/d/e/2PACX-1vAbC_d-123/pub?output=csv";

const CSV = [
  "Catégorie,Nom,Description,Prix,Disponible",
  'Plats,Amiwo au poulet,"Pâte de maïs rouge, poulet braisé",3 500,oui',
  'Plats,"Pâte rouge ""spéciale""",,4 000 FCFA,Non',
  "Boissons,Bissap,,500,",
  "Boissons,Jus du jour,,à voir,oui",
  ",,,,",
  "Desserts,<img src=x onerror=alert(1)>,,1000,oui",
].join("\r\n");

test("lit le CSV de Google Sheets (guillemets, virgules, CRLF)", () => {
  const l = lireCsv(CSV);
  assert.equal(l.length, 6);
  assert.equal(l[1][2], "Pâte de maïs rouge, poulet braisé");
  assert.equal(l[2][1], 'Pâte rouge "spéciale"');
});

test("transforme en articles validés", () => {
  const { articles, erreurs } = catalogueDepuisCsv(CSV);
  assert.equal(articles.length, 5);
  assert.deepEqual(articles[0], { categorie: "Plats", nom: "Amiwo au poulet", description: "Pâte de maïs rouge, poulet braisé", prix: 3500, disponible: true });
  assert.equal(articles[1].prix, 4000);
  assert.equal(articles[1].disponible, false);
  assert.equal(articles[2].disponible, true, "une case vide vaut disponible");
  assert.equal(articles[3].prix, null, "prix non numérique : sur demande");
  assert.match(erreurs[0], /à voir/);
  assert.equal(articles[4].nom, "<img src=x onerror=alert(1)>", "le texte est gardé tel quel ; il sera posé en textContent");
});

test("colonnes dans un autre ordre, sans accents", () => {
  const { articles } = catalogueDepuisCsv("prix,nom,categorie\n1500,Atassi,Plats\n");
  assert.deepEqual(articles[0], { categorie: "Plats", nom: "Atassi", description: "", prix: 1500, disponible: true });
});

test("sans colonne nom : erreur claire", () => {
  assert.match(catalogueDepuisCsv("titre,prix\nx,1\n").erreurs[0], /nom/);
});

test("n'accepte que les adresses de publication Google Sheets en CSV", () => {
  assert.equal(urlCatalogueValide(URL_OK), true);
  for (const u of ["http://docs.google.com/spreadsheets/d/e/x/pub?output=csv", "https://evil.example/spreadsheets/d/e/x/pub?output=csv",
    "https://docs.google.com/spreadsheets/d/e/x/pub?output=html", "https://docs.google.com.evil.example/spreadsheets/d/e/x/pub?output=csv", "", "pas une url"])
    assert.equal(urlCatalogueValide(u), false, u);
});

test("redirections : Google accepté, autre hôte refusé, boucle arrêtée", async () => {
  assert.equal(hoteRedirectionValide("https://doc-0g-8s-sheets.googleusercontent.com/pub/abc"), true);
  for (const u of ["http://doc-0g-sheets.googleusercontent.com/x", "https://evil.googleusercontent.com.evil.example/x", "https://169.254.169.254/latest", "https://docs.google.com:8443/x"])
    assert.equal(hoteRedirectionValide(u), false, u);
  const vers = (lieu) => new Response(null, { status: 307, headers: { location: lieu } });
  let n = 0;
  const google = async () => (n++ === 0 ? vers("https://doc-0g-8s-sheets.googleusercontent.com/pub/x") : new Response("nom\nA\n"));
  assert.equal(await (await recupererCsv(URL_OK, { fetchImpl: google })).text(), "nom\nA\n");
  await assert.rejects(recupererCsv(URL_OK, { fetchImpl: async () => vers("https://169.254.169.254/latest/meta-data") }), /non autorisé/);
  await assert.rejects(recupererCsv(URL_OK, { fetchImpl: async () => vers(URL_OK) }), /trop de redirections/);
});

test("fonction /api/catalogue : JSON, cache CDN, adresse non configurée", async () => {
  const { default: fonction, config } = await import(join(modele, "netlify/functions/catalogue.mjs"));
  assert.equal(config.path, "/api/catalogue");
  const fetchOrigine = globalThis.fetch;
  try {
    delete process.env.CATALOGUE_CSV_URL;
    assert.equal((await fonction()).status, 503);
    process.env.CATALOGUE_CSV_URL = URL_OK;
    globalThis.fetch = async (url) => { assert.equal(url, URL_OK); return new Response(CSV); };
    const r = await fonction();
    assert.equal(r.status, 200);
    assert.match(r.headers.get("netlify-cdn-cache-control"), /s-maxage=300/);
    assert.equal((await r.json()).articles.length, 5);
    globalThis.fetch = async () => new Response("", { status: 500 });
    assert.equal((await fonction()).status, 502);
  } finally {
    globalThis.fetch = fetchOrigine;
    delete process.env.CATALOGUE_CSV_URL;
  }
});

test("actualisation dans le navigateur : textContent seulement, indisponible signalé", async (t) => {
  let chromium;
  // require (et non import) : Playwright est souvent installé globalement, ce que seul require trouve.
  try { ({ chromium } = createRequire(import.meta.url)("playwright")); } catch { t.skip("playwright absent"); return; }
  const navigateur = await chromium.launch();
  try {
    const page = await navigateur.newPage();
    const { articles } = catalogueDepuisCsv(CSV);
    await page.route("**/api/catalogue", (r) => r.fulfill({ contentType: "application/json", body: JSON.stringify({ articles }) }));
    await page.route("http://site.test/", (r) => r.fulfill({ contentType: "text/html; charset=utf-8", body: `<!doctype html><meta charset="utf-8"><div data-catalogue>
      <template data-modele-categorie><h3 data-champ="categorie"></h3></template>
      <template data-modele-article><article><h4 data-champ="nom"></h4><p data-champ="description"></p><p data-champ="prix"></p><span data-champ="indisponible" hidden>Indisponible</span></article></template>
      <article data-article><h4>Ancien article</h4></article></div>
      <script type="module">${readFileSync(join(modele, "src/scripts/catalogue-actualiser.js"), "utf8")}</script>` }));
    let alerte = false;
    page.on("dialog", (d) => { alerte = true; d.dismiss(); });
    await page.goto("http://site.test/");
    await page.waitForSelector("article[data-article] h4:text('Amiwo au poulet')");
    const r = await page.evaluate(() => ({
      articles: [...document.querySelectorAll("[data-catalogue] > article")].map((a) => [a.querySelector("h4").textContent, a.querySelector('[data-champ="prix"]').textContent, a.querySelector('[data-champ="indisponible"]').hidden]),
      categories: [...document.querySelectorAll("[data-catalogue] > h3")].map((h) => h.textContent),
      img: document.querySelectorAll("[data-catalogue] img").length,
    }));
    assert.deepEqual(r.categories, ["Plats", "Boissons", "Desserts"]);
    assert.equal(r.articles.length, 5, "l'ancien article de l'instantané est remplacé");
    assert.deepEqual(r.articles[0], ["Amiwo au poulet", "3 500 FCFA", true]);
    assert.equal(r.articles[1][2], false, "Pâte rouge : Indisponible visible");
    assert.equal(r.articles[3][1], "Prix sur demande");
    assert.equal(r.img, 0, "aucune balise injectée");
    await page.waitForTimeout(300);
    assert.equal(alerte, false);
  } finally { await navigateur.close(); }
});
