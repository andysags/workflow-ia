# Skills et plugins des agents

Ce fichier liste les skills et plugins utilisés par les agents, leur source et la version installée.

## Frontend / Design : UI/UX Pro Max

- **Source** : https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- **Révision** : `28b3b8dee8c976df4fa3e94aed4e092ad43fcb03` (v2.15.0)
- **Licence** : MIT (`ui-styling` contient son propre `LICENSE.txt`)
- **Emplacement** : `.claude/skills/`
- **Prérequis** : Python 3 (bibliothèque standard uniquement). Node.js pour les scripts `.cjs` de `brand` et `design-system`.

| Skill | Rôle | Agent concerné |
|---|---|---|
| `ui-ux-pro-max` | Moteur de recherche de styles, palettes, typographies, règles UX et bonnes pratiques par stack (Astro, Next.js…) | Designer, Dev front |
| `design-system` | Génération et validation de design tokens | Designer |
| `ui-styling` | Tailwind et shadcn/ui | Dev front |
| `brand` | Identité de marque, extraction des couleurs | Designer |
| `design` | Logos, icônes, identité visuelle | Designer |
| `banner-design` | Bannières | Designer |
| `slides` | Présentations | (optionnel) |

**Modification locale** : dans `ui-ux-pro-max/SKILL.md`, le chemin `${CLAUDE_PLUGIN_ROOT}` est remplacé par `${CLAUDE_PLUGIN_ROOT:-.}`. Ainsi, le script se lance depuis la racine du projet quand le skill est installé hors plugin.

**Test** : `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "restaurant reservation" --design-system -p "Test"`

**Points d'attention** :
- `design/scripts/logo/generate.py` appelle des API externes de génération d'image (Gemini, AtlasCloud, MuAPI), uniquement si une clé API est fournie.
- `ui-styling/scripts/shadcn_add.py` exécute la CLI shadcn (`npx`) dans le projet cible.

## Sécurité : Claude Security (Anthropic)

- **Source** : marketplace officielle `anthropics/claude-plugins-official`, plugin `claude-security` (v0.11.0 au moment de l'ajout)
- **Licence** : propriétaire Anthropic. Le plugin n'est **pas copié** dans le repo, il est seulement déclaré dans `.claude/settings.json`.
- **Installation manuelle** si besoin : `/plugin install claude-security@claude-plugins-official`
- **Usage** : `/claude-security` → scan multi-agents, vérification de chaque faille trouvée, puis génération de patchs.
- **Agent concerné** : Sécurité. Il bloque le déploiement en cas de faille critique.
