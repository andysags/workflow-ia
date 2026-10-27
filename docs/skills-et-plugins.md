# Skills et plugins des agents

Statut :
- ✅ skill installé dans le repo (`.claude/skills/`)
- 🔌 plugin déclaré dans le repo (`.claude/settings.json`) : Claude Code propose de l'activer à l'ouverture du projet
- 👤 plugin installé sur le compte claude.ai (catalogue Anthropic Directory) : non déclarable dans le repo, faute de source publique
- ❌ rien d'existant, à écrire nous-mêmes

## Bilan par agent

| Agent | Skills / plugins | Statut |
|---|---|---|
| **Orchestrateur** | **solofounder** : `flow-composer` (compose les étapes), `role-generator` (génère les rôles spécialisés), `exception-enforcement`, `verification`, `mockup-server` | 👤 |
| **Orchestrateur** | **agent-discussion** : débat entre agents via un fichier partagé | 👤 |
| 1. Brainstorming / Product | **product-management** (Anthropic) : `product-brainstorming`, `write-spec`, `competitive-brief` | 🔌 |
| 2. Architecte | `spike` : prototype jetable pour valider une approche | ✅ |
| 2. Architecte | **backend-design** : `boring-by-default`, agent `boring-tech-advisor` (refuse une techno inutilement complexe) | 👤 |
| 3. Designer UI/UX | `ui-ux-pro-max`, `design-system`, `brand`, `design`, `banner-design` | ✅ |
| 4. Rédacteur | **Website Copywriting & Positioning** | 👤 à installer |
| 4. SEO | **SEO Audit** | 👤 à installer |
| 5. Dev front | `ui-ux-pro-max` (règles par stack : Astro, Next.js…), `ui-styling` (Tailwind, shadcn/ui) | ✅ |
| 6. Dev back | **backend-design** : conception d'API, schémas de base de données, gestion des erreurs, idempotence | 👤 |
| 6. Dev back | **backend-performance-review** : détection des goulots d'étranglement (requêtes N+1…) | 👤 |
| 7. QA | **playwright** (Microsoft) : pilote un vrai navigateur, clique, prend des captures | 🔌 |
| 7. QA | **solofounder** : `verification`, `tdd-methodology`, `systematic-debugging` | 👤 |
| 8. Sécurité | **claude-security** (Anthropic) : scan multi-agents et patchs vérifiés | 🔌 + 👤 |
| 8. Sécurité | **backend-design** : `security-discipline`, agent `security-reviewer` (contrôle rapide après chaque modification) | 👤 |
| 9. DevOps : GitHub | `github` : PR, CI, releases | ✅ |
| 9. DevOps : hébergement | **netlify-skills** (Netlify) : déploiement, formulaires, fonctions, base de données, domaines | 🔌 |
| Transverse | `skill-creator` : écrire et valider nos propres skills d'agents | ✅ |
| Transverse | **adaptive-agent** : `skill-review` (fait évoluer les skills avec l'usage), `build-user-profile` (mémorise le profil de l'utilisateur) | 👤 |
| Transverse | `slides` : présentations | ✅ |

## Détail des sources

### UI/UX Pro Max

- **Source** : https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- **Révision** : `28b3b8dee8c976df4fa3e94aed4e092ad43fcb03` (v2.15.0)
- **Licence** : MIT (`ui-styling` contient son propre `LICENSE.txt`)
- **Skills** : `ui-ux-pro-max`, `design-system`, `ui-styling`, `brand`, `design`, `banner-design`, `slides`
- **Prérequis** : Python 3 (bibliothèque standard uniquement). Node.js pour les scripts `.cjs` de `brand` et `design-system`.
- **Modification locale** : dans `ui-ux-pro-max/SKILL.md`, `${CLAUDE_PLUGIN_ROOT}` est remplacé par `${CLAUDE_PLUGIN_ROOT:-.}`. Ainsi, le script se lance depuis la racine du projet quand le skill est installé hors plugin.
- **Test** : `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "restaurant reservation" --design-system -p "Test"`
- **Points d'attention** :
  - `design/scripts/logo/generate.py` appelle des API externes de génération d'image (Gemini, AtlasCloud, MuAPI), uniquement si une clé API est fournie.
  - `ui-styling/scripts/shadcn_add.py` exécute la CLI shadcn (`npx`) dans le projet cible.

### OpenClaw : `github`, `spike`, `skill-creator`

- **Source** : https://github.com/openclaw/openclaw (dossier `skills/`)
- **Révision** : `2bfc47bc6038f851066f45dd02c247519f29ebc3`
- **Licence** : MIT (`skill-creator` contient son propre `license.txt`)
- **Prérequis** :
  - `github` : la CLI `gh`, authentifiée.
  - `skill-creator` : Python 3.
- **Particularités OpenClaw à connaître** :
  - `skill-creator` mentionne `{baseDir}` et l'outil `skill_workshop`, qui n'existent que dans OpenClaw. Avec Claude Code, il faut lancer `python3 .claude/skills/skill-creator/scripts/quick_validate.py <dossier-du-skill>` depuis la racine du projet.
  - Son validateur refuse le champ `argument-hint`, pourtant valide dans Claude Code. Les avertissements sur les skills UI/UX Pro Max sont donc sans conséquence.
  - `spike` crée ses prototypes dans `.tmp/openclaw-spikes/<slug>` par défaut, ou dans `spikes/<NNN-slug>/` si on le demande.
  - Un skill Anthropic porte aussi le nom `skill-creator` (`anthropic-skills:skill-creator`). Le nôtre est celui du projet.

### Claude Security (Anthropic)

- **Source** : marketplace officielle `anthropics/claude-plugins-official`, plugin `claude-security` (v0.11.0 au moment de l'ajout)
- **Licence** : propriétaire Anthropic. Le plugin n'est **pas copié** dans le repo, il est seulement déclaré dans `.claude/settings.json`.
- **Installation manuelle** si besoin : `/plugin install claude-security@claude-plugins-official`
- **Usage** : `/claude-security` → scan multi-agents, vérification de chaque faille trouvée, puis génération de patchs.

### Plugins déclarés dans `.claude/settings.json`

| Plugin | Marketplace (repo GitHub) | Remarque |
|---|---|---|
| `claude-security` | `anthropics/claude-plugins-official` | Licence propriétaire Anthropic |
| `playwright` | `anthropics/claude-plugins-official` | Serveur MCP de Microsoft, lancé via `npx` |
| `product-management` | `anthropics/knowledge-work-plugins` | Contient aussi des connecteurs (Linear, Notion…) optionnels |
| `netlify-skills` | `netlify/context-and-tools` | Repo officiel de Netlify. Il faudra un compte et un jeton Netlify pour déployer |

### Plugins du compte claude.ai (Anthropic Directory)

Ils sont installés sur le compte du propriétaire du projet, pas dans le repo. Un collaborateur doit les ajouter depuis le catalogue claude.ai.

| Plugin | Auteur | Licence | Source publique |
|---|---|---|---|
| `solofounder` (v0.5.0) | non renseigné | MIT | aucune |
| `agent-discussion` (v0.1.0) | Cyrus Liu | non renseignée | https://github.com/cyrusxyl/agent-discussion |
| `adaptive-agent` | LJ Li | non renseignée | https://github.com/truenorth-lj/adaptive-agent-skill |
| `backend-design` (v0.2.0) | sheitabrk | MIT | https://github.com/sheitabrk/backend-design |
| `backend-performance-review` (v2.0.0) | Sanoy24 | MIT | https://github.com/Sanoy24/backend-performance-review (avec marketplace) |
| Website Copywriting & Positioning | Sergey Skripko | — | aucune (catalogue uniquement) |
| SEO Audit | Sergey Skripko | — | aucune (catalogue uniquement) |
