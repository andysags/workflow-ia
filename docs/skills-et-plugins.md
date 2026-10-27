# Skills et plugins des agents

Statut : ✅ installé dans le repo · 🔌 plugin déclaré dans `.claude/settings.json` · 💡 proposé, pas encore installé · ❌ aucun outil, à écrire nous-mêmes

## Bilan par agent

| Agent | Skills / plugins | Statut |
|---|---|---|
| 1. Brainstorming / Product | Plugin **Product Management** (Anthropic) : `product-brainstorming`, `write-spec` | 💡 |
| 2. Architecte | `spike` (OpenClaw) : prototype jetable pour valider une approche | ✅ |
| 3. Designer UI/UX | `ui-ux-pro-max`, `design-system`, `brand`, `design`, `banner-design` | ✅ |
| 4. Rédacteur / SEO | Plugins **Website Copywriting & Positioning** et **SEO Audit** | 💡 |
| 5. Dev front | `ui-ux-pro-max` (règles par stack : Astro, Next.js…), `ui-styling` (Tailwind, shadcn/ui) | ✅ |
| 6. Dev back | Plugin **backend-design** (actif sur le compte, pas déclaré dans le repo) | 💡 |
| 7. QA | Plugin **playwright** (Microsoft) pour piloter un vrai navigateur | 💡 |
| 8. Sécurité | Plugin **claude-security** (Anthropic) | 🔌 |
| 9. DevOps | `github` (OpenClaw) : PR, CI, releases via la CLI `gh` | ✅ |
| 9. DevOps (hébergement) | Plugin **Netlify**, ou un skill de déploiement à écrire | 💡 / ❌ |
| Transverse | `skill-creator` (OpenClaw) : écrire et valider nos propres skills d'agents | ✅ |
| Transverse | `slides` : présentations (non rattaché à un agent) | ✅ |

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
