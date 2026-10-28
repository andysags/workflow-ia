#!/usr/bin/env node
// Cherche des photos libres de droits sur Wikimedia Commons, pour un client qui n'a pas encore ses propres photos.
// Ne retient que les licences qui autorisent l'usage commercial et la modification : CC0, domaine public, CC BY, CC BY-SA.
//
// Usage :
//   node photos-libres.mjs "<recherche>" <dossier-sortie> [--nombre 6]
//   node photos-libres.mjs "<recherche>" <dossier-sortie> --depuis <reponse.json> --sans-telechargement   (test hors ligne)
//
// Écrit dans <dossier-sortie> : les photos candidates, et LICENCES.json + LICENCES.md (auteur, licence, source, attribution).
// Dernière ligne : PHOTOS: <n> candidates dans <dossier>   ou   PHOTOS: AUCUNE <raison>

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const option = (nom) => { const i = args.indexOf(nom); return i >= 0 ? args[i + 1] : undefined; };
const [recherche, sortie] = args.filter((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--") && ["--nombre", "--depuis"].includes(args[i - 1])));
const nombre = Number(option("--nombre") ?? 6);
const depuis = option("--depuis");
const sansTelechargement = args.includes("--sans-telechargement");
const UA = "workflow-ia/0.5 (https://github.com/andysags/workflow-ia; photos libres pour sites de petites entreprises)";

function fin(ligne) { console.log(ligne); process.exit(0); }
if (!recherche || !sortie) { console.error('Usage : node photos-libres.mjs "<recherche>" <dossier-sortie> [--nombre 6]'); process.exit(2); }

// Licences acceptées (code « License » de Commons). Refusées : NC (pas d'usage commercial), ND (pas de modification), usage loyal.
const licenceAcceptee = (code) => /^(cc0|pd|pd-.+|public domain|cc-by-\d|cc-by-sa-\d)/i.test(code ?? "") && !/-nc|-nd/i.test(code ?? "");
const texte = (html) => (html ?? "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/\s+/g, " ").trim();
const nomFichier = (titre, ext) => titre.replace(/^File:/, "").replace(/\.[a-z]+$/i, "").normalize("NFD").replace(/[̀-ͯ]/g, "")
  .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) + ext;

async function obtenir(url, binaire = false) {
  for (let essai = 0; essai < 4; essai++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(60000) });
      if (r.status === 429 || r.status >= 500) throw new Error(`HTTP ${r.status}`);
      if (!r.ok) return { erreur: `HTTP ${r.status}` };
      return { data: binaire ? Buffer.from(await r.arrayBuffer()) : await r.json() };
    } catch (e) {
      if (essai === 3) return { erreur: e.message };
      await new Promise((ok) => setTimeout(ok, 5000 * (essai + 1)));
    }
  }
}

// 1. Recherche
let reponse;
if (depuis) reponse = JSON.parse(readFileSync(depuis, "utf8"));
else {
  const q = new URLSearchParams({
    action: "query", format: "json", generator: "search", gsrsearch: `${recherche} filetype:bitmap`, gsrnamespace: "6",
    gsrlimit: String(Math.min(50, nombre * 4)), prop: "imageinfo", iiprop: "url|extmetadata|size|mime", iiurlwidth: "1600",
    iiextmetadatafilter: "LicenseShortName|License|Artist|AttributionRequired|LicenseUrl|ImageDescription",
  });
  const r = await obtenir(`https://commons.wikimedia.org/w/api.php?${q}`);
  if (r.erreur) fin(`PHOTOS: AUCUNE Wikimedia Commons ne répond pas (${r.erreur}) : réessayez dans quelques minutes`);
  reponse = r.data;
}

// 2. Filtre : licence, taille, format
const pages = Object.values(reponse?.query?.pages ?? {}).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
const ecartees = [];
const retenues = [];
for (const p of pages) {
  const ii = p.imageinfo?.[0]; const m = ii?.extmetadata ?? {};
  const code = m.License?.value ?? m.LicenseShortName?.value;
  if (!ii) continue;
  if (!licenceAcceptee(code)) { ecartees.push(`${p.title} : licence ${m.LicenseShortName?.value ?? "inconnue"}`); continue; }
  if (ii.width < 1000) { ecartees.push(`${p.title} : trop petite (${ii.width} px)`); continue; }
  if (!/image\/(jpeg|png|webp)/.test(ii.mime ?? "")) { ecartees.push(`${p.title} : format ${ii.mime}`); continue; }
  const attribution = (m.AttributionRequired?.value ?? "true") !== "false" && !/^(cc0|pd)/i.test(code);
  retenues.push({
    fichier: nomFichier(p.title, ii.mime === "image/png" ? ".png" : ii.mime === "image/webp" ? ".webp" : ".jpg"),
    titre: p.title.replace(/^File:/, ""),
    description: texte(m.ImageDescription?.value).slice(0, 300),
    auteur: texte(m.Artist?.value) || "auteur inconnu",
    licence: m.LicenseShortName?.value ?? code,
    url_licence: m.LicenseUrl?.value ?? null,
    source: ii.descriptionurl,
    attribution_requise: attribution,
    credit: attribution
      ? `Photo : ${texte(m.Artist?.value) || "auteur inconnu"}, ${m.LicenseShortName?.value ?? code}, via Wikimedia Commons (${ii.descriptionurl})`
      : `Photo : ${texte(m.Artist?.value) || "auteur inconnu"}, ${m.LicenseShortName?.value ?? code} (aucune attribution requise)`,
    url_image: (ii.thumburl ?? ii.url).replace(/[?&]utm_[^&]*/g, ""),
  });
  if (retenues.length >= nombre) break;
}
if (!retenues.length) fin(`PHOTOS: AUCUNE aucune photo libre exploitable pour « ${recherche} » (${ecartees.length} écartées) : essayez une recherche plus large ou en anglais`);

// 3. Téléchargement
mkdirSync(sortie, { recursive: true });
for (const r of retenues) {
  if (sansTelechargement) continue;
  const t = await obtenir(r.url_image, true);
  if (t.erreur) { r.erreur = t.erreur; continue; }
  writeFileSync(join(sortie, r.fichier), t.data);
  await new Promise((ok) => setTimeout(ok, 1500)); // politesse envers Wikimedia
}
const ok = retenues.filter((r) => !r.erreur);
writeFileSync(join(sortie, "LICENCES.json"), JSON.stringify({ recherche, date: new Date().toISOString().slice(0, 10), photos: ok, ecartees }, null, 2));
writeFileSync(join(sortie, "LICENCES.md"), [
  `# Photos libres : « ${recherche} »`, "",
  "Photos de Wikimedia Commons sous licence libre. Elles illustrent l'activité : elles ne montrent pas le lieu ni les produits du client.",
  "Les photos marquées « attribution requise » doivent être créditées sur le site (auteur, licence avec lien, source), et la mention « modifiée » ajoutée si elles sont recadrées ou converties.", "",
  "| Fichier | Ce qu'elle montre | Auteur | Licence | Attribution requise | Source |", "|---|---|---|---|---|---|",
  ...ok.map((r) => `| ${r.fichier} | ${r.description || r.titre} | ${r.auteur} | ${r.licence} | ${r.attribution_requise ? "oui" : "non"} | ${r.source} |`),
  "", ecartees.length ? `Écartées : ${ecartees.length} (${ecartees.slice(0, 5).join(" ; ")}${ecartees.length > 5 ? " …" : ""})` : "",
].join("\n") + "\n");
fin(ok.length ? `PHOTOS: ${ok.length} candidates dans ${sortie}` : `PHOTOS: AUCUNE téléchargement impossible (${retenues[0].erreur})`);
