// Lecture du catalogue tenu par le client dans Google Sheets (publié au format CSV).
// Partagé par la fonction Netlify (/api/catalogue) et l'instantané du build. Aucune dépendance.

export const COLONNES = ["categorie", "nom", "description", "prix", "disponible"];
const MAX_LIGNES = 500;
const MAX_CHAMP = 300;

// Seules les adresses de publication Google Sheets sont acceptées : le catalogue ne peut pas pointer ailleurs.
export function urlCatalogueValide(url) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.hostname === "docs.google.com" && /^\/spreadsheets\/d\/e\/[\w-]+\/pub$/.test(u.pathname)
      && u.searchParams.get("output") === "csv";
  } catch { return false; }
}

// Hôtes acceptés après une redirection : Google sert souvent le CSV publié depuis doc-xx-xx-sheets.googleusercontent.com.
const MAX_REDIRECTIONS = 3;
export function hoteRedirectionValide(url) {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" || u.username || u.password || (u.port && u.port !== "443")) return false;
    return u.hostname === "docs.google.com" || /^doc-[a-z0-9-]+\.googleusercontent\.com$/.test(u.hostname);
  } catch { return false; }
}

// Télécharge le CSV en suivant au plus 3 redirections, chacune revalidée : la fonction ne peut pas être
// emmenée vers un autre serveur (SSRF). Renvoie la réponse finale, ou lève une erreur.
export async function recupererCsv(url, { timeout = 8000, fetchImpl = fetch } = {}) {
  const signal = AbortSignal.timeout(timeout);
  let courante = url;
  for (let i = 0; i <= MAX_REDIRECTIONS; i++) {
    const r = await fetchImpl(courante, { redirect: "manual", signal });
    if (r.status < 300 || r.status >= 400) return r;
    const lieu = r.headers.get("location");
    if (!lieu) throw new Error("redirection sans destination");
    const suivante = new URL(lieu, courante).href;
    if (!hoteRedirectionValide(suivante)) throw new Error("redirection vers un hôte non autorisé");
    courante = suivante;
  }
  throw new Error("trop de redirections");
}

// Analyse CSV (RFC 4180 : guillemets, virgules et retours à la ligne dans les champs).
export function lireCsv(texte) {
  const lignes = []; let ligne = []; let champ = ""; let guillemets = false;
  for (let i = 0; i < texte.length; i++) {
    const c = texte[i];
    if (guillemets) {
      if (c === '"' && texte[i + 1] === '"') { champ += '"'; i++; }
      else if (c === '"') guillemets = false;
      else champ += c;
    } else if (c === '"') guillemets = true;
    else if (c === ",") { ligne.push(champ); champ = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && texte[i + 1] === "\n") i++;
      ligne.push(champ); lignes.push(ligne); ligne = []; champ = "";
    } else champ += c;
  }
  if (champ !== "" || ligne.length) { ligne.push(champ); lignes.push(ligne); }
  return lignes.filter((l) => l.some((v) => v.trim() !== ""));
}

const cle = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "");
const propre = (s) => String(s ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, MAX_CHAMP);

// Transforme le CSV en articles validés. Les colonnes sont reconnues par leur titre, dans n'importe quel ordre.
export function catalogueDepuisCsv(texte) {
  const [entete, ...lignes] = lireCsv(texte);
  if (!entete) return { articles: [], erreurs: ["tableau vide"] };
  const index = Object.fromEntries(entete.map((t, i) => [cle(t), i]));
  if (index.nom === undefined) return { articles: [], erreurs: ["colonne « nom » introuvable"] };
  const erreurs = [];
  const articles = [];
  for (const [n, l] of lignes.slice(0, MAX_LIGNES).entries()) {
    const v = (c) => (index[c] === undefined ? "" : propre(l[index[c]]));
    const nom = v("nom");
    if (!nom) continue;
    const prixBrut = v("prix").replace(/[\s  .]/g, "").replace(/f?cfa|fr?$/i, "");
    const prix = /^\d{1,9}$/.test(prixBrut) ? Number(prixBrut) : null;
    if (v("prix") && prix === null) erreurs.push(`ligne ${n + 2} : prix « ${v("prix")} » non reconnu (affiché « sur demande »)`);
    const dispo = cle(v("disponible"));
    articles.push({
      categorie: v("categorie"),
      nom,
      description: v("description"),
      prix,
      disponible: !["non", "no", "0", "faux", "false", "rupture", "indisponible"].includes(dispo),
    });
  }
  if (lignes.length > MAX_LIGNES) erreurs.push(`plus de ${MAX_LIGNES} lignes : les suivantes sont ignorées`);
  return { articles, erreurs };
}
