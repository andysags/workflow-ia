# Catalogue modifiable par le client (Google Sheets)

À utiliser quand le client veut changer lui-même ses prix, ses plats du jour, ses produits ou leur disponibilité, sans repasser par Claude. Il modifie un tableau Google Sheets sur son téléphone. Le site se met à jour en 5 minutes environ, sans redéploiement.

## Comment ça marche

```
Google Sheet publié en CSV ──► /api/catalogue (Netlify Function) ──► page du site (actualisation)
           │                         lit, valide, met 5 min en cache
           └──► build (prebuild) ──► src/data/catalogue.json ──► rendu HTML statique (visible sans JavaScript)
```

- **Instantané au build** : la page est complète même sans JavaScript, ou si Google ne répond pas.
- **Actualisation** : au chargement de la page, un petit script lit `/api/catalogue` et remplace la liste.
- **Pourquoi une fonction** : un navigateur ne peut pas lire directement un tableau publié, car Google bloque ces lectures depuis une autre page web. La fonction lit le tableau côté serveur et sert les données depuis le même domaine que le site. La CSP reste donc à `connect-src 'self'`.
- Aucun secret, aucune base de données. L'adresse du tableau publié est publique.

## Modèle à copier

Dans `${CLAUDE_PLUGIN_ROOT}/skills/creer-site/modeles/catalogue/` :

| Fichier du modèle | Où le copier dans `site/` | Rôle |
|---|---|---|
| `catalogue.config.mjs` | `catalogue.config.mjs` | adresse du tableau, à renseigner |
| `src/lib/catalogue-csv.mjs` | `src/lib/catalogue-csv.mjs` | lecture et validation du CSV (partagé) |
| `netlify/functions/catalogue.mjs` | `netlify/functions/catalogue.mjs` | `GET /api/catalogue` |
| `scripts/catalogue-instantane.mjs` | `scripts/catalogue-instantane.mjs` | instantané avant le build : `"prebuild": "node scripts/catalogue-instantane.mjs"` |
| `src/scripts/catalogue-actualiser.js` | `src/scripts/catalogue-actualiser.js` | actualisation dans la page (`<script>import "../scripts/catalogue-actualiser.js"</script>` dans le composant) |

Copie ces fichiers **sans les réécrire** : ils sont testés (`scripts/tests/catalogue.test.mjs`). Le design du catalogue reste libre, à condition d'utiliser ce balisage :

```html
<div data-catalogue>
  <template data-modele-categorie><h3 data-champ="categorie"></h3></template>
  <template data-modele-article>
    <article>
      <h4 data-champ="nom"></h4>
      <p data-champ="description"></p>
      <p data-champ="prix"></p>
      <span data-champ="indisponible" hidden>Indisponible</span>
    </article>
  </template>
  <!-- Instantané rendu au build depuis src/data/catalogue.json, avec les mêmes balises
       et l'attribut data-categorie sur chaque titre, data-article sur chaque article -->
</div>
```

`netlify.toml` doit contenir `[functions] directory = "netlify/functions"`. Le script de déploiement est lancé depuis `site/` et envoie la fonction avec le site.

## Le tableau du client

Colonnes, dans n'importe quel ordre. Seule `nom` est obligatoire :

| categorie | nom | description | prix | disponible |
|---|---|---|---|---|
| Plats | Amiwo au poulet | Pâte de maïs rouge, poulet braisé | 3500 | oui |
| Boissons | Bissap | | 500 | non |

- **Prix :** un nombre en FCFA (`3500`, `3 500` ou `3 500 FCFA`). Un prix vide ou du texte s'affiche « Prix sur demande ».
- **Disponible :** `non` affiche « Indisponible ». Une case vide vaut « oui ».
- **Limites :** 500 lignes au maximum, 300 caractères par case. Le texte est affiché tel quel, et le HTML n'est jamais interprété.

## Guide pour le client (à mettre dans `09-deploiement.md` et le bilan)

1. Sur Google Sheets (application ou sheets.google.com), créez un tableau avec les colonnes **categorie, nom, description, prix, disponible**, puis remplissez-le.
2. Menu **Fichier → Partager → Publier sur le web**. Choisissez la feuille, puis le format **Valeurs séparées par des virgules (.csv)**, et cliquez sur **Publier**. Copiez le lien obtenu : il se termine par `pub?output=csv`.
3. Donnez ce lien à l'équipe une seule fois. Ensuite, chaque changement du tableau apparaît sur le site en 5 minutes environ.
4. Ne mettez dans ce tableau que des informations publiques : il est lisible par toute personne qui a le lien.

## Quand l'utiliser

- Le brief prévoit une liste qui change souvent : menu du jour, prix, stock, catalogue de tissus, horaires de séances.
- Ne l'utilise pas pour une liste stable de quelques éléments : du contenu statique suffit, et c'est plus simple.
- La fonction relève du **Dev back**, donc `DEV_BACK: OUI`, même si le code vient du modèle. La Sécurité vérifie la fonction comme toute fonction serveur.
