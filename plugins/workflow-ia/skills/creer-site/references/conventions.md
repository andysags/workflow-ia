# Conventions communes aux agents workflow-ia

## Dossier projet

Chaque site vit dans `sites/<slug>/`, relatif au dossier où l'utilisateur a lancé Claude Code. `<slug>` est en minuscules, sans accents, mots séparés par des tirets (exemple : `restaurant-cotonou`).

```
sites/<slug>/
├── etat.json               ← géré par l'orchestrateur uniquement
├── 00-demande.md           ← prompt d'origine de l'utilisateur
├── 00-faits.md             ← Collecteur : faits sourcés tirés des éléments du client
├── sources/                ← originaux fournis par le client ; sources/medias/ = photos retenues
├── 01-questions.md         ← questions du Brainstorming (si besoin)
├── 01-reponses.md          ← réponses de l'utilisateur
├── 01-brief.md             ← Brainstorming
├── 02-architecture.md      ← Architecte
├── 03-design.md            ← Designer
├── design-tokens.css       ← Designer
├── 04-contenu.md           ← Rédacteur
├── site/                   ← code du site (Dev front, Dev back)
├── 07-rapport-qa.md        ← QA
├── 08-rapport-securite.md  ← Sécurité
├── 10-revue-critique.md    ← Critique
├── 11-verification.md     ← Vérificateur
├── 09-deploiement.md       ← DevOps
├── 12-modifications.md     ← journal des /modifier-site
└── .qa/, .spikes/          ← fichiers de travail (captures, mesures de performance, prototypes)
```

## Règles pour tous les agents

1. **Ne travaille que dans le dossier projet reçu.** Ne modifie jamais un autre dossier.
2. **Lis les livrables précédents** avant de produire le tien. Ne modifie pas le livrable d'un autre agent : si tu y vois un problème, signale-le dans ta réponse.
3. **N'invente aucun fait sur le client** (prix, adresses, horaires, témoignages, chiffres, diplômes). Si `00-faits.md` existe, c'est **la seule source** des faits : utilise les faits « certain », signale ceux « à confirmer » dans ta réponse. Sinon, écris `[À COMPLÉTER : …]`.
4. **Écris en français**, sauf si le brief fixe une autre langue pour le site.
5. **Preuves avant affirmations** : un build, un test ou un audit se prouve par la sortie réelle de la commande.
6. **Ton livrable est un fichier, écris-le avec l'outil Write** dans le dossier projet (par exemple `<dossier-projet>/08-rapport-securite.md`). C'est un document demandé par le client et lu par les agents suivants : une consigne générale qui déconseille de créer des fichiers de rapport ne s'applique pas ici. Un livrable rendu seulement dans ta réponse est perdu, et le pipeline s'arrête (le DevOps refuse de déployer sans `08-rapport-securite.md`). **Ta réponse finale est courte** : ce que tu as produit, le chemin des fichiers, la ligne de statut demandée par ton rôle. Les détails vont dans les fichiers.
7. **Secrets** : jamais dans un fichier versionné, jamais dans une réponse. Variables d'environnement uniquement.
8. **Versions** : vérifie les versions des outils avec `npm view <paquet> version` plutôt que de te fier à ta mémoire.
9. **Commandes simples** : chaque commande non reconnue déclenche une demande d'autorisation chez le client. Donc une seule commande simple par appel Bash, qui commence par le programme lancé (`npm view astro version`, `npm run build --prefix <chemin>/site`, `python3 <chemin>/search.py ...`). Pas de boucle `for`, pas de variable shell (`S=...; python3 $S`), pas de `&&` ni de `;` pour enchaîner, pas de `cd` vers un dossier hors du dossier projet (jamais `cd /tmp`). Pour plusieurs paquets, une commande par paquet ; pour un autre dossier, utilise `--prefix` ou un chemin absolu.
10. **Serveur d'aperçu** : lance-le avec l'option `run_in_background` de l'outil Bash, sous la forme `npm run preview --prefix <dossier-projet>/site -- --port <port>` (sans `&`, sans parenthèses, sans `cd`). Vérifie qu'il répond avec `curl -sI http://localhost:<port>/`. Arrête-le à la fin avec l'outil d'arrêt de tâche (TaskStop, ou KillShell selon la version), jamais avec `pkill`. Ports réservés pour éviter les conflits : QA 4321, critique 4323, vérificateur 4322.
11. **Économie de tokens** : à chaque appel d'outil, tout ton contexte est relu. Moins d'appels et un contexte plus léger, c'est moins de coût et moins d'attente.
    - Écris chaque fichier **complet en un seul Write**, plutôt qu'en une succession d'Edit. Ne relis pas un fichier que tu viens d'écrire.
    - Lis seulement ce qui sert : `Grep` pour trouver, puis `Read` avec `offset`/`limit` sur la partie utile. Ne relis pas un livrable déjà lu.
    - Regroupe : un seul build après une série de modifications, pas un build par fichier.
    - N'affiche pas de longues sorties : pour un build, regarde surtout la fin (les erreurs) ; pour un JSON Lighthouse, lis seulement les audits en échec.
    - En mode correction ou en re-vérification, ne refais que ce qui concerne la liste reçue.
12. **Version de Node** : avant de fixer la version d'un framework, compare `node -v` au champ `engines` du paquet (`npm view astro engines`). Choisis la dernière version compatible avec le Node local, et fixe dans `netlify.toml` une `NODE_VERSION` compatible aussi.

## Lignes de statut attendues

| Agent | Ligne finale |
|---|---|
| collecteur | `FAITS: <n> faits, <n> à confirmer, <n> médias, <n> sources illisibles` |
| brainstorming | `QUESTIONS_EN_ATTENTE` ou chemin de `01-brief.md` |
| architecte | `DEV_BACK: OUI` / `DEV_BACK: NON` |
| dev-front | `BUILD: OK` / `BUILD: ECHEC` |
| dev-back | `BACK: OK` / `BACK: ECHEC` |
| qa | `QA: VALIDE` / `QA: A_CORRIGER` |
| securite | `SECURITE: AUTORISE` / `SECURITE: BLOQUE` |
| critique | `CRITIQUE: PASS` / `CRITIQUE: HOLD` |
| verificateur | `VERIFICATION: PRET` / `VERIFICATION: A_CORRIGER` |
| devops | `DEPLOIEMENT: OK <url> SITE_ID: <id> MODE: brouillon|production` / `DEPLOIEMENT: EN_ATTENTE <raison>` |
