# Conventions communes aux agents workflow-ia

## Dossier projet

Chaque site vit dans `sites/<slug>/`, relatif au dossier où l'utilisateur a lancé Claude Code. `<slug>` est en minuscules, sans accents, mots séparés par des tirets (exemple : `restaurant-cotonou`).

```
sites/<slug>/
├── etat.json               ← géré par l'orchestrateur uniquement
├── 00-demande.md           ← prompt d'origine de l'utilisateur
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
└── .qa/, .spikes/          ← fichiers de travail (captures, mesures de performance, prototypes)
```

## Règles pour tous les agents

1. **Ne travaille que dans le dossier projet reçu.** Ne modifie jamais un autre dossier.
2. **Lis les livrables précédents** avant de produire le tien. Ne modifie pas le livrable d'un autre agent : si tu y vois un problème, signale-le dans ta réponse.
3. **N'invente aucun fait sur le client** (prix, adresses, horaires, témoignages, chiffres, diplômes). Écris `[À COMPLÉTER : …]`.
4. **Écris en français**, sauf si le brief fixe une autre langue pour le site.
5. **Preuves avant affirmations** : un build, un test ou un audit se prouve par la sortie réelle de la commande.
6. **Ta réponse finale est courte** : ce que tu as produit, le chemin des fichiers, la ligne de statut demandée par ton rôle. Les détails vont dans les fichiers.
7. **Secrets** : jamais dans un fichier versionné, jamais dans une réponse. Variables d'environnement uniquement.
8. **Versions** : vérifie les versions des outils avec `npm view <paquet> version` plutôt que de te fier à ta mémoire.

## Lignes de statut attendues

| Agent | Ligne finale |
|---|---|
| brainstorming | `QUESTIONS_EN_ATTENTE` ou chemin de `01-brief.md` |
| architecte | `DEV_BACK: OUI` / `DEV_BACK: NON` |
| dev-front | `BUILD: OK` / `BUILD: ECHEC` |
| dev-back | `BACK: OK` / `BACK: ECHEC` |
| qa | `QA: VALIDE` / `QA: A_CORRIGER` |
| securite | `SECURITE: AUTORISE` / `SECURITE: BLOQUE` |
| critique | `CRITIQUE: PASS` / `CRITIQUE: HOLD` |
| verificateur | `VERIFICATION: PRET` / `VERIFICATION: A_CORRIGER` |
| devops | `DEPLOIEMENT: OK <url>` / `DEPLOIEMENT: EN_ATTENTE <raison>` |
