# Composants tiers

Ce repo redistribue les plugins suivants. Chacun garde sa licence d'origine dans son dossier.

| Dossier | Origine | Licence | Version | Modifications |
|---|---|---|---|---|
| `plugins/ui-ux-pro-max` | https://github.com/nextlevelbuilder/ui-ux-pro-max-skill, commit `28b3b8d` | MIT (`ui-styling` : voir son `LICENSE.txt`) | 2.15.0 | `marketplace.json` d'origine retiré |
| `plugins/openclaw-skills` | https://github.com/openclaw/openclaw (`skills/github`, `skills/spike`, `skills/skill-creator`), commit `2bfc47b` | MIT | — | Regroupés dans un plugin, `plugin.json` ajouté |
| `plugins/copywriting-kit` | Anthropic Directory, auteur Sergey Skripko | MIT | 0.1.28 | aucune |
| `plugins/seo-audit` | Anthropic Directory, auteur Sergey Skripko | MIT | 0.1.28 | aucune |
| `plugins/backend-design` | https://github.com/sheitabrk/backend-design | MIT | 0.2.0 | aucune |
| `plugins/backend-performance-review` | https://github.com/Sanoy24/backend-performance-review | MIT | 2.0.0 | `marketplace.json` d'origine retiré |
| `plugins/solofounder` | Anthropic Directory, auteur Oleksandr Karpinskyi | MIT | 0.5.0 | Hook `SessionStart` retiré (`hooks/hooks.json`, `hooks/hooks-cursor.json`) : il prenait le contrôle de chaque session et entrait en conflit avec l'orchestrateur `/creer-site`. `marketplace.json` d'origine retiré |
| `plugins/agent-discussion` | https://github.com/cyrusxyl/agent-discussion | MIT | 0.1.0 | aucune |
| `plugins/adaptive-agent` | https://github.com/truenorth-lj/adaptive-agent-skill | MIT | — | aucune |

Plugins recommandés mais **non redistribués** (installés depuis leur marketplace d'origine) :

| Plugin | Marketplace | Licence |
|---|---|---|
| `claude-security` | `anthropics/claude-plugins-official` | Propriétaire Anthropic |
| `playwright` | `anthropics/claude-plugins-official` | Microsoft |
| `netlify-skills` | `netlify/context-and-tools` | Netlify |
| `product-management` | `anthropics/knowledge-work-plugins` | Anthropic |
