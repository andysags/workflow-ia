# workflow-ia : du prompt au site en ligne

Un seul prompt décrit le site voulu (« un site vitrine pour mon restaurant à Cotonou, avec menu et réservation »).
Une équipe d'agents IA, chacun spécialisé, accompagne ensuite l'utilisateur du brainstorming jusqu'au
déploiement d'un MVP en ligne.

## L'équipe d'agents

| # | Agent | Livrable |
|---|---|---|
| 1 | Brainstorming / Product | Cahier des charges (`01-brief.md`) |
| 2 | Architecte | Plan technique (`02-architecture.md`) |
| 3 | Designer UI/UX | Design system (`03-design.json`) |
| 4 | Rédacteur / SEO | Contenus (`04-contenu.md`) |
| 5 | Dev front | Code du site (`site/`) |
| 6 | Dev back (si besoin) | API, formulaires, base de données |
| 7 | QA | Rapport de tests (`07-rapport-qa.md`) |
| 8 | Sécurité | Rapport d'audit (`08-rapport-secu.md`), peut bloquer le déploiement |
| 9 | DevOps | URL en ligne (`09-deploiement.json`) |

Un orchestrateur fait circuler les livrables entre les agents et demande la validation de
l'utilisateur aux étapes clés : cahier des charges, maquette, mise en ligne.

## Skills et plugins

Chaque agent s'appuie sur des skills et plugins existants. Les skills installés sont dans
`.claude/skills/`, et les plugins sont déclarés dans `.claude/settings.json`.
L'inventaire complet par agent est dans [docs/skills-et-plugins.md](docs/skills-et-plugins.md).

## Feuille de route

1. **Fondations** : orchestrateur, dossier projet et agent Brainstorming
2. **Premier site** : Architecte et Dev front
3. **Mise en ligne** : DevOps (premier MVP)
4. **Qualité** : Designer, Rédacteur, QA et Sécurité, avec les boucles de correction
5. **Expérience utilisateur** : application web et suivi en temps réel
6. **Sites complexes** : Dev back et e-commerce
