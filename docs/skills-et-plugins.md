# Skills et plugins par agent

Chaque agent de `plugins/workflow-ia/agents/` appelle les skills ci-dessous avec l'outil Skill, sous leur nom complet `plugin:skill`.

Légende :
- 📦 redistribué dans ce repo, installé automatiquement avec `workflow-ia`
- ⭐ recommandé, à installer depuis sa marketplace d'origine (voir README)
- 🔁 solution de repli intégrée à l'agent si le plugin recommandé est absent

| Agent | Skills utilisés | Statut |
|---|---|---|
| **Orchestrateur** (`/workflow-ia:creer-site`) | Pilote les 11 agents, `adaptive-agent:skill-review` (option en fin de projet) | 📦 |
| **1. brainstorming** | `product-management:product-brainstorming` | ⭐ 🔁 méthode intégrée |
| **2. architecte** | `backend-design:boring-by-default`, `openclaw-skills:spike` | 📦 |
| **3. designer** | `ui-ux-pro-max:ui-ux-pro-max` (script de recherche), `ui-ux-pro-max:design-system` | 📦 |
| **3. redacteur** | `copywriting-kit:brand-voice`, `copywriting-kit:landing-page-copy`, `copywriting-kit:copy-proof-check` | 📦 |
| **4. dev-front** | `ui-ux-pro-max:ui-ux-pro-max` (`--stack`), `ui-ux-pro-max:ui-styling`, `solofounder:systematic-debugging`, `solofounder:verification` | 📦 |
| **4. dev-back** | `backend-design:*` (think-before-coding, error-handling, auth, idempotency, data-modeling, testing), `backend-performance-review`, `solofounder:verification` | 📦 |
| **5. qa** | serveur MCP `playwright` ; `seo-audit:technical-seo-code-audit` ; script `perf-mobile.mjs` | ⭐ 🔁 script Playwright Node ; 📦 |
| **6. securite** | `backend-design:security-discipline`, `backend-design:auth-and-authorization` ; scan approfondi `/claude-security` | 📦 ; ⭐ optionnel |
| **7. critique** | Aucun skill : regard neuf, captures Playwright, test des 5 secondes et test de banalité (adapté d'agency-agents) | 📦 |
| **7. verificateur** | Script `perf-mobile.mjs` (Lighthouse mobile ralenti), contre-vérification des rapports QA et Sécurité (adapté d'agency-agents) | 📦 |
| **8. devops** | `openclaw-skills:github` ; `netlify-skills` | 📦 ; ⭐ 🔁 `npx netlify-cli` |

Également disponibles pour l'utilisateur : `agent-discussion` (débat entre agents de plateformes différentes), `openclaw-skills:skill-creator` (écrire de nouveaux skills), les autres skills de `ui-ux-pro-max` (`brand`, `design`, `banner-design`, `slides`), `seo-audit` et `copywriting-kit`.

## Points d'attention

- **ui-ux-pro-max** : le script de recherche demande Python 3 (bibliothèque standard uniquement). `design/scripts/logo/generate.py` appelle des API d'images externes (Gemini, AtlasCloud, MuAPI), uniquement si une clé API est fournie. `ui-styling/scripts/shadcn_add.py` lance la CLI shadcn via `npx`.
- **backend-design** : installe trois hooks `PreToolUse` sur `Write|Edit` (contrôles de migration, de composant backend et de sécurité) qui lancent `python`. Sur une machine où seul `python3` existe, ces hooks échouent sans bloquer.
- **openclaw-skills:skill-creator** mentionne `{baseDir}` et `skill_workshop`, propres à OpenClaw. Son script se lance avec `python3 <chemin>/scripts/quick_validate.py <dossier-du-skill>`. Il refuse le champ `argument-hint`, pourtant valide dans Claude Code.
- **solofounder** : son hook `SessionStart` a été retiré (voir `NOTICE.md`). Ses skills restent utilisables à la demande.

Sources, versions et licences : voir [NOTICE.md](../NOTICE.md).
