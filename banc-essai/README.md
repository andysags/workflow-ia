# Banc d'essai

Le banc d'essai fait passer **11 demandes de référence** dans le pipeline complet (`/workflow-ia:creer-site --auto`), puis compare les résultats. Il sert à savoir si une modification des agents améliore ou dégrade la qualité des sites.

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
| `atelier-couture-lome` | formation (inscription payante, Mobile Money) | Togo |

Pour ajouter un cas : un fichier `cas/<nom>.md`, avec un en-tête `secteur` et `pays`, puis la demande telle qu'un client l'écrirait.

## Lancer

Depuis la racine du repo :

```bash
banc-essai/lancer.sh                                  # les 11 cas
banc-essai/lancer.sh restaurant-cotonou festival-jazz  # quelques cas
PARALLELE=3 banc-essai/lancer.sh                      # 3 cas en même temps
PLUGINS=/copie/plugins banc-essai/lancer.sh           # une copie figée des plugins
```

Pour mesurer une version pendant que vous en modifiez une autre, copiez `plugins/` et passez la copie avec `PLUGINS`.

Chaque cas tourne dans `banc-essai/resultats/<date>/<cas>/`, avec les plugins du repo (`--plugin-dir plugins`), donc **la version en cours de modification**, pas celle de la marketplace.

**Coût :** environ 4 à 4,50 $ et 25 à 30 minutes par cas (mesuré au Sprint 1). Lancez d'abord 2 ou 3 cas.

**Limite d'usage :** avec un abonnement Claude (et non une clé API), plusieurs cas en parallèle peuvent épuiser la limite de la période. Au Sprint 1, 3 cas en parallèle l'ont atteinte avant la fin de la revue finale. Préférez `PARALLELE=1` (la valeur par défaut), ou une clé API.

Pour régénérer un rapport sans relancer : `node banc-essai/rapport.mjs banc-essai/resultats/<date>`.

## Ce que mesure le rapport

| Colonne | Source |
|---|---|
| Build, Pages | présence de `site/dist/*.html` |
| QA, Sécurité, Critique, Vérif. | verdicts de `07`, `08`, `10`, `11` |
| Perf mobile, Perf/A11y/SEO min, LCP max | `.qa/verification/mesures.json` (sinon `.qa/perf/`), mesures Lighthouse sur mobile ralenti |
| À compléter | nombre de `À COMPLÉTER` dans les pages publiées |
| Contacts | liens `wa.me` et `tel:` des pages publiées. Ils sont faux (❌) si le numéro n'est pas en chiffres internationaux ou si le texte du message est mal encodé |
| Coût, Durée | session `claude -p` (`run.jsonl`), durée réelle |
| Détail | agents lancés, erreurs d'outils, décisions prises automatiquement |

Un site est considéré comme **réussi** quand le build passe, que la sécurité autorise, que la critique répond PASS et que le vérificateur répond PRET.

## Limites

- Les commandes autorisées sont limitées à une liste (voir `lancer.sh`). Une commande hors liste est refusée, ce qui compte dans les erreurs d'outils.
- Avec `NETLIFY_AUTH_TOKEN` défini, chaque cas est mis en ligne en brouillon (un site Netlify par cas). Sans jeton, le déploiement n'est pas testé.
- Une seule exécution par cas donne une tendance, pas une certitude : l'IA ne produit pas deux fois le même site.

## Tests ciblés par agent

Le pipeline complet coûte plusieurs dollars par cas. Pour vérifier un seul agent, `tester-agent.sh` le lance sur une **fixture** : un petit dossier projet piégé, avec le résultat attendu.

```bash
banc-essai/tester-agent.sh                    # tous les tests
banc-essai/tester-agent.sh securite-paiement  # un test
```

| Test | Agent | Ce qui est vérifié |
|---|---|---|
| `securite-paiement` | securite | Une page de paiement Mobile Money mal sécurisée est **bloquée**, et les 5 failles sont citées : clé secrète dans le navigateur, inscription confirmée sans vérification serveur, montant modifiable dans l'URL, CSP trop large, `innerHTML` |
| `collecteur-hors-sujet` | collecteur | Sur 3 photos envoyées par un restaurant, seule celle du plat est retenue dans `sources/medias/`. Les 2 photos d'ordinateur sont décrites et écartées |
| `redacteur-sans-invention` | redacteur | Un brief de salon de coiffure sans aucune info : aucun prix, numéro, horaire ni avis inventé, des `[À COMPLÉTER]` à la place, et le pack Afrique appliqué (FCFA, WhatsApp, ARTCI) |
| `qa-liens-contact` | qa | Une page de maquis avec 4 liens WhatsApp ou téléphone faux (espaces, `+`, numéro tronqué, lien sans numéro) : la QA demande des corrections et les signale |

Pour ajouter un test : un dossier `agents/<test>/` avec `projet/` (le dossier donné à l'agent, jamais modifié : il est copié à chaque essai) et `attendu.md`. L'en-tête d'`attendu.md` contient `agent`, `consigne` et `fichier` (le livrable à contrôler), puis des contrôles, tous facultatifs :
- `statut` : la ligne de statut attendue ;
- `mots` : des expressions régulières qui doivent apparaître dans le livrable ;
- `interdits` : des expressions qui ne doivent **pas** y apparaître, comme un faux numéro ou un faux prix ;
- `fichiers` : un nombre de fichiers attendu, par exemple `sources/medias/* = 1`.
