// GET /api/catalogue : lit le Google Sheet publié du client et renvoie le catalogue en JSON.
// L'adresse du tableau est dans catalogue.config.mjs (publique, ce n'est pas un secret).
// Le CDN de Netlify garde la réponse 5 minutes : le tableau n'est pas relu à chaque visite.
import { catalogueDepuisCsv, urlCatalogueValide } from "../../src/lib/catalogue-csv.mjs";
import { CATALOGUE_CSV_URL } from "../../catalogue.config.mjs";

export default async () => {
  const url = process.env.CATALOGUE_CSV_URL || CATALOGUE_CSV_URL;
  const json = (corps, statut = 200, cache = "public, durable, s-maxage=300, stale-while-revalidate=86400") =>
    new Response(JSON.stringify(corps), {
      status: statut,
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-cache", "netlify-cdn-cache-control": cache },
    });
  if (!urlCatalogueValide(url)) return json({ erreur: "catalogue non configuré" }, 503, "no-store");
  try {
    const r = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(8000) });
    if (!r.ok) return json({ erreur: "tableau indisponible" }, 502, "no-store");
    const texte = await r.text();
    if (texte.length > 1_000_000) return json({ erreur: "tableau trop volumineux" }, 502, "no-store");
    const { articles } = catalogueDepuisCsv(texte);
    return json({ articles, mis_a_jour: new Date().toISOString() });
  } catch {
    return json({ erreur: "tableau indisponible" }, 502, "no-store");
  }
};

export const config = { path: "/api/catalogue" };
