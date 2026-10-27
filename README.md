# workflow-ia : un site web en un prompt

Décrivez le site que vous voulez en une phrase. Une équipe de 11 agents IA s'occupe du reste, du cahier des charges jusqu'à la mise en ligne sur Netlify, en vous demandant votre avis aux moments importants.

```
/workflow-ia:creer-site Un site vitrine pour mon restaurant à Cotonou, avec le menu et la réservation de table
```

## Installation

### 1. Prérequis

- [Claude Code](https://code.claude.com) (abonnement Claude)
- [Node.js](https://nodejs.org) 20 ou plus, `git`, et [Python 3](https://www.python.org)
- Pour la mise en ligne : un compte [Netlify](https://www.netlify.com) gratuit et un jeton d'accès (voir plus bas)
- Optionnel : la [CLI GitHub](https://cli.github.com) connectée (`gh auth login`), pour que le code de chaque site soit poussé sur votre GitHub

### 2. Installer le plugin

Dans Claude Code, tapez ces deux commandes :

```
/plugin marketplace add andysags/workflow-ia
/plugin install workflow-ia@workflow-ia
```

Le plugin `workflow-ia` installe automatiquement ses 9 dépendances (design, rédaction, SEO, backend…).

### 3. Ajouter les plugins recommandés

Ils ne sont pas obligatoires : sans eux, les agents utilisent une solution de repli. Ils rendent l'équipe plus efficace.

```
/plugin install playwright@claude-plugins-official
/plugin install claude-security@claude-plugins-official
/plugin marketplace add netlify/context-and-tools
/plugin install netlify-skills@netlify-context-and-tools
/plugin marketplace add anthropics/knowledge-work-plugins
/plugin install product-management@knowledge-work-plugins
```

Si Claude Code ne trouve pas `claude-plugins-official`, ajoutez-la d'abord : `/plugin marketplace add anthropics/claude-plugins-official`.

Tapez ensuite `/reload-plugins`, ou redémarrez Claude Code.

### Variante : cloner le repo

```bash
git clone https://github.com/andysags/workflow-ia.git
cd workflow-ia
claude
```

Dans Claude Code, enregistrez le dossier cloné comme marketplace, puis installez le plugin :

```
/plugin marketplace add ./
/plugin install workflow-ia@workflow-ia
```

Avec cette variante, vos modifications des agents sont prises en compte après un `/reload-plugins`, ce qui est pratique pour adapter l'équipe à vos besoins.

### 4. Jeton Netlify (pour la mise en ligne)

1. Sur Netlify : **User settings → Applications → Personal access tokens → New access token**.
2. Avant de lancer Claude Code, définissez-le dans votre terminal :
   - macOS / Linux : `export NETLIFY_AUTH_TOKEN="votre-jeton"`
   - Windows (PowerShell) : `$env:NETLIFY_AUTH_TOKEN="votre-jeton"`

Ne collez jamais ce jeton dans la conversation. Sans jeton, le site est construit et testé en local, et vous pourrez le mettre en ligne plus tard.

## Utilisation

Placez-vous dans le dossier où vous voulez créer vos sites, lancez `claude`, puis :

```
/workflow-ia:creer-site <description de votre site>
```

Chaque site est créé dans `sites/<nom-du-site>/`, avec tous les documents de travail. Pour reprendre un projet interrompu :

```
/workflow-ia:creer-site reprendre <nom-du-site>
```

### Donner vos éléments existants

Photos, menu ou catalogue (même photographié), flyer, documents, texte, page Facebook ou ancien site : donnez-les avec `--sources`. L'agent **collecteur** en tire une fiche de faits, chaque fait avec sa source, et l'équipe s'en sert au lieu de laisser des `[À COMPLÉTER]`.

```
/workflow-ia:creer-site Un site pour mon restaurant à Cotonou --sources menu.jpg infos.txt photo-salle.jpg
```

### Faire évoluer un site

```
/workflow-ia:modifier-site <nom-du-site> "Change les horaires : fermé le lundi"
/workflow-ia:modifier-site <nom-du-site> "Voici mes vraies photos" --sources photos/
/workflow-ia:modifier-site <nom-du-site> "Ajoute une page Événements"
```

Seuls les agents utiles travaillent (un changement de prix ne mobilise pas le designer), les contrôles sont proportionnés à la modification (la Sécurité intervient dès que du code, un formulaire ou une dépendance change), et le site est remis en ligne **au même endroit**. Chaque modification est notée dans `12-modifications.md`, et peut être annulée.

## Ce qui se passe

| Étape | Agent | Ce qu'il produit | Votre rôle |
|---|---|---|---|
| 1 | Brainstorming | Cahier des charges du MVP (`01-brief.md`) | Répondre à quelques questions, puis **valider** |
| 2 | Architecte | Choix techniques (`02-architecture.md`) | — |
| 3 | Designer + Rédacteur | Charte graphique (`03-design.md`), textes et SEO (`04-contenu.md`) | **Valider**, donner les infos manquantes (adresse, prix…) |
| 4 | Dev front (+ Dev back si besoin) | Le site (`site/`) | — |
| 5 | QA | Tests dans un vrai navigateur et **performance sur mobile ralenti** (`07-rapport-qa.md`), jusqu'à 3 tours de corrections | — |
| 6 | Sécurité | Audit, y compris les failles typiques du code écrit par une IA (`08-rapport-securite.md`). **Bloque la mise en ligne** en cas de faille grave | Accepter ou non un scan approfondi |
| 7 | Critique + Vérificateur | Revue finale : un regard neuf qui refuse le design « passe-partout » (`10-revue-critique.md`), et une contre-vérification de toutes les affirmations avec preuves (`11-verification.md`) | — |
| 8 | DevOps | Repo GitHub et mise en ligne Netlify (`09-deploiement.md`) | **Valider** la mise en ligne |

**Mode automatique :** ajoutez `--auto` à la fin de votre demande pour que l'équipe décide seule à chaque étape (toutes ses décisions sont notées dans `etat.json`). Le site est alors mis en ligne en brouillon uniquement.

**Mode premium :** ajoutez `--premium` pour que le designer, le développeur, la sécurité et la critique travaillent avec le modèle le plus puissant (Opus). La qualité est meilleure, mais le coût est environ doublé. Par défaut, chaque agent utilise un modèle adapté à sa tâche (Sonnet, Haiku pour la mise en ligne), quel que soit le modèle de votre session.

**Coût et durée indicatifs :** environ 5 $ et 25 à 35 minutes par site, mesurés sur le banc d'essai avant les optimisations de la version 0.3.

Par défaut, les sites sont construits avec **Astro + Tailwind CSS**, et les formulaires passent par **Netlify Forms**, sans serveur à gérer.

## Garde-fous

Certaines actions sont trop risquées pour reposer uniquement sur les consignes des agents. Le plugin installe un **hook** que Claude Code exécute avant chaque commande :

- **Déploiement Netlify** : dans un projet workflow-ia, tout `netlify deploy` sans dossier désigné (`--dir`) est bloqué. Partout, un dossier publié qui n'est pas un site construit (pas d'`index.html`), qui contient des fichiers internes (journaux, livrables, `.env`, `.git`, `node_modules`) ou trop de fichiers est refusé. Ce garde-fou a été ajouté après un incident réel : un déploiement lancé depuis le mauvais dossier avait publié des journaux de travail.

Tests : `node --test plugins/workflow-ia/hooks/garde-deploiement.test.mjs`

## Ce que l'équipe ne fait pas (encore)

- Elle n'invente aucune information sur votre activité. Ce qui manque est marqué `[À COMPLÉTER]` : donnez vos éléments avec `--sources` pour les remplir.
- Sans vos photos, les images sont des emplacements à remplacer. Elle ne prend jamais d'images sur internet.
- Les mentions légales sont des modèles à faire relire.
- Le nom de domaine personnalisé se configure ensuite dans Netlify.

## Qualité mesurée

Le dossier [`banc-essai/`](banc-essai/README.md) fait passer 10 demandes de référence (restaurant, salon, ONG, avocat, école, artisan, photographe, paroisse, boutique, festival) dans le pipeline complet, et compare les sites obtenus : build, verdicts, performance mobile, accessibilité, coût.

## Contenu du repo

Ce repo est une **marketplace Claude Code** (`.claude-plugin/marketplace.json`) qui contient 10 plugins :

| Plugin | Rôle | Origine |
|---|---|---|
| `workflow-ia` | Orchestrateur `/creer-site` et les 11 agents | ce projet (critique, vérificateur et contrôles IA de la sécurité adaptés de [The Agency](https://github.com/msitarzewski/agency-agents), MIT) |
| `ui-ux-pro-max` | Design system, palettes, typographies, règles UX | [nextlevelbuilder](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) |
| `openclaw-skills` | `github`, `spike`, `skill-creator` | [OpenClaw](https://github.com/openclaw/openclaw) |
| `copywriting-kit` | Rédaction de pages | Sergey Skripko |
| `seo-audit` | Audit SEO technique | Sergey Skripko |
| `backend-design` | Conception et sécurité backend | [sheitabrk](https://github.com/sheitabrk/backend-design) |
| `backend-performance-review` | Performance backend | [Sanoy24](https://github.com/Sanoy24/backend-performance-review) |
| `solofounder` | Vérification, TDD, débogage | Oleksandr Karpinskyi |
| `agent-discussion` | Débat entre agents | [cyrusxyl](https://github.com/cyrusxyl/agent-discussion) |
| `adaptive-agent` | Amélioration continue des skills | [truenorth-lj](https://github.com/truenorth-lj/adaptive-agent-skill) |

Tous les plugins tiers sont sous licence MIT et redistribués avec leur licence d'origine. Le détail des sources, versions et modifications est dans [NOTICE.md](NOTICE.md) et [docs/skills-et-plugins.md](docs/skills-et-plugins.md).

## Licence

Le code de ce projet (`plugins/workflow-ia`, documentation) est sous licence [MIT](LICENSE). Chaque plugin tiers du dossier `plugins/` garde sa propre licence, voir [NOTICE.md](NOTICE.md).
