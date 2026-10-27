// Actualise la liste du catalogue avec /api/catalogue, sans recharger la page.
// Balisage attendu (le design reste libre ; chaque modèle a UN élément racine) :
//   <div data-catalogue>
//     <template data-modele-categorie><h3 data-champ="categorie"></h3></template>   (facultatif)
//     <template data-modele-article>
//       <article><h4 data-champ="nom"></h4><p data-champ="description"></p>
//       <p data-champ="prix"></p><span data-champ="indisponible" hidden>Indisponible</span></article>
//     </template>
//     <h3 data-categorie>…</h3> <article data-article>…</article>   ← instantané rendu au build, remplacé ici
//   </div>
// Les données sont posées avec textContent uniquement : aucun HTML venu du tableau n'est interprété.
const prixFCFA = (p) => (p == null ? "Prix sur demande" : `${new Intl.NumberFormat("fr-FR").format(p)} FCFA`);
const champs = (racine, champ) => [racine, ...racine.querySelectorAll(`[data-champ="${champ}"]`)].filter((e) => e.matches(`[data-champ="${champ}"]`));

function cloner(modele, marque) {
  const racine = modele.content.firstElementChild.cloneNode(true);
  racine.setAttribute(marque, "");
  return racine;
}

async function actualiser(conteneur) {
  const modele = conteneur.querySelector("template[data-modele-article]");
  if (!modele?.content.firstElementChild) return;
  let donnees;
  try {
    const r = await fetch("/api/catalogue", { headers: { accept: "application/json" } });
    if (!r.ok) return; // l'instantané du build reste affiché
    donnees = await r.json();
  } catch { return; }
  if (!Array.isArray(donnees.articles) || donnees.articles.length === 0) return;
  const modeleCategorie = conteneur.querySelector("template[data-modele-categorie]");
  const nouveaux = [];
  let categorie = null;
  for (const a of donnees.articles) {
    if (modeleCategorie?.content.firstElementChild && a.categorie && a.categorie !== categorie) {
      categorie = a.categorie;
      const c = cloner(modeleCategorie, "data-categorie");
      champs(c, "categorie").forEach((e) => { e.textContent = a.categorie; });
      nouveaux.push(c);
    }
    const el = cloner(modele, "data-article");
    champs(el, "nom").forEach((e) => { e.textContent = a.nom; });
    champs(el, "description").forEach((e) => { e.textContent = a.description ?? ""; e.hidden = !a.description; });
    champs(el, "prix").forEach((e) => { e.textContent = prixFCFA(a.prix); });
    champs(el, "categorie").forEach((e) => { e.textContent = a.categorie ?? ""; });
    champs(el, "indisponible").forEach((e) => { e.hidden = a.disponible !== false; });
    if (a.disponible === false) el.setAttribute("data-indisponible", "");
    nouveaux.push(el);
  }
  conteneur.querySelectorAll(":scope > [data-article], :scope > [data-categorie]").forEach((e) => e.remove());
  conteneur.append(...nouveaux);
}

document.querySelectorAll("[data-catalogue]").forEach((c) => { actualiser(c); });
