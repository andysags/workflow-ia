# Banc d'essai

Le banc d'essai fait passer **10 demandes de référence** dans le pipeline complet (`/workflow-ia:creer-site --auto`), puis compare les résultats. Il sert à savoir si une modification des agents améliore ou dégrade la qualité des sites.

## Les cas

| Cas | Secteur | Pays |
|---|---|---|
| `restaurant-cotonou` | restauration (réservation, WhatsApp) | Bénin |
| `salon-coiffure-abidjan` | beauté (rendez-vous mobile) | Côte d'Ivoire |
| `ong-education-lome` | associatif (bénévoles, dons) | Togo |
| `cabinet-avocat-dakar` | juridique (site sobre, contact) | Sénégal |
| `ecole-privee-ouagadougou` | éducation (inscriptions) | Burkina Faso |
| `menuisier-douala` | artisanat (réalisations, devis) | Cameroun |
| `photographe-paris` | créatif (portfolio, disponibilités) | France |
| `eglise-porto-novo` | culte (horaires, événements) | Bénin |
| `boutique-pagne-cotonou` | commerce (catalogue, commande WhatsApp) | Bénin |
| `festival-jazz` | événement (landing page, billetterie) | Bénin |

Pour ajouter un cas : un fichier `cas/<nom>.md`, avec un en-tête `secteur` et `pays`, puis la demande telle qu'un client l'écrirait.

## Lancer

Depuis la racine du repo :

```bash
banc-essai/lancer.sh                                  # les 10 cas
banc-essai/lancer.sh restaurant-cotonou festival-jazz  # quelques cas
PARALLELE=3 banc-essai/lancer.sh                      # 3 cas en même temps
```

Chaque cas tourne dans `banc-essai/resultats/<date>/<cas>/`, avec les plugins du repo (`--plugin-dir plugins`), donc **la version en cours de modification**, pas celle de la marketplace.

**Coût :** comptez plusieurs dollars par cas (environ 4 $ pour le premier test, avant l'ajout de la revue finale). Lancez d'abord 2 ou 3 cas.

Pour régénérer un rapport sans relancer : `node banc-essai/rapport.mjs banc-essai/resultats/<date>`.

## Ce que mesure le rapport

| Colonne | Source |
|---|---|
| Build, Pages | présence de `site/dist/*.html` |
| QA, Sécurité, Critique, Vérif. | verdicts de `07`, `08`, `10`, `11` |
| Perf mobile, Perf/A11y/SEO min, LCP max | `.qa/verification/mesures.json` (sinon `.qa/perf/`), mesures Lighthouse sur mobile ralenti |
| À compléter | nombre de `À COMPLÉTER` dans les pages publiées |
| Coût, Durée | session `claude -p` (`run.jsonl`), durée réelle |
| Détail | agents lancés, erreurs d'outils, décisions prises automatiquement |

Un site est considéré comme **réussi** quand le build passe, que la sécurité autorise, que la critique répond PASS et que le vérificateur répond PRET.

## Limites

- Les commandes autorisées sont limitées à une liste (voir `lancer.sh`). Une commande hors liste est refusée, ce qui compte dans les erreurs d'outils.
- Les cas tournent sans jeton Netlify : le déploiement n'est pas testé.
- Une seule exécution par cas donne une tendance, pas une certitude : l'IA ne produit pas deux fois le même site.
