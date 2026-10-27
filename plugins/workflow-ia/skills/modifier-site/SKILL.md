---
name: modifier-site
description: Fait évoluer un site déjà créé par workflow-ia (dans sites/<slug>/) - changer un texte, un prix, des horaires, une couleur, ajouter une page ou une section, intégrer les photos ou le menu fournis par le client - puis le revérifie et le remet en ligne au même endroit. Utiliser quand l'utilisateur veut modifier, mettre à jour, compléter ou corriger un site existant, ou lui fournit des informations ou des fichiers pour son site.
argument-hint: <slug> "<modification demandée>" [--sources <fichiers ou URL>] [--auto]
---

# Modifier un site existant

Tu es l'**orchestrateur** des modifications. Comme pour `/workflow-ia:creer-site`, tu ne produis aucun livrable toi-même : tu choisis les agents **strictement nécessaires**, tu proportionnes les contrôles à l'ampleur du changement, et tu remets le site en ligne. Parle au client en français simple.

Demande : $ARGUMENTS

Conventions des agents : `${CLAUDE_PLUGIN_ROOT}/skills/creer-site/references/conventions.md`. Les règles d'orchestration, de sobriété et de mode automatique de `${CLAUDE_PLUGIN_ROOT}/skills/creer-site/SKILL.md` s'appliquent aussi ici (lis seulement leurs sections « Règles d'orchestration », « Budget et sobriété » et « Mode automatique »).

## Étape 0 : retrouver le site

1. Le premier mot de `$ARGUMENTS` est le slug. S'il manque ou ne correspond à aucun dossier de `sites/`, liste les sites existants (`sites/*/etat.json`) et demande lequel modifier.
2. Lis `etat.json` (étape, URL et `site_id` de déploiement). Si le site n'est pas allé au bout de `/workflow-ia:creer-site`, propose plutôt `/workflow-ia:creer-site reprendre <slug>`.
3. Si `--sources` est présent, ou si le client a joint des fichiers ou collé du texte dans sa demande, note-les. Un texte collé est enregistré dans `sources/texte-client.md`.
4. Ajoute une entrée en cours dans `modifications` de `etat.json` : `{ "id": <n>, "demande": "...", "date": "...", "statut": "en_cours" }`.

## Étape 1 : collecte (si des sources sont fournies)

**Fichiers rangés ailleurs** : Claude Code ne lit et ne copie librement que dans le dossier où il a été lancé. Si une source est ailleurs (Téléchargements, Bureau…), copie-la toi-même dans `sites/<slug>/sources/` avec **une commande `cp` par fichier**, avant de lancer le collecteur. Le client verra une demande d'autorisation : dis-lui en une phrase que c'est pour copier ses fichiers dans le projet. Si c'est refusé (ou en mode automatique), demande-lui de déposer ses fichiers dans `sites/<slug>/sources/`, ou continue sans eux et note-le comme réserve. Le collecteur travaille ensuite sur ces copies.


Lance `workflow-ia:collecteur` avec le dossier projet et la liste des sources. Résume au client ce qui a été trouvé (`FAITS:`), les sources illisibles, et les **conflits** à trancher. En mode interactif, demande-lui de trancher les conflits et de confirmer les faits « à confirmer » qui changent le site (prix, horaires, téléphone) avant de continuer.

## Étape 2 : qualifier la modification

Classe la demande dans une ou plusieurs catégories, et choisis la chaîne d'agents **minimale** :

| Catégorie | Exemples | Agents | Contrôles |
|---|---|---|---|
| Contenu | texte, prix, horaires, téléphone, remplir les `[À COMPLÉTER]` avec `00-faits.md` | `redacteur` (met à jour `04-contenu.md`), puis `dev-front` | QA ciblée |
| Médias | intégrer les photos de `sources/medias/` | `dev-front` (images dans `src/assets/` via `astro:assets`, jamais dans `public/`) | QA ciblée + performance mobile des pages touchées + poids des images servies (WebP, 300 Ko maximum) |
| Design | couleur, police, style d'une section | `designer` (met à jour `03-design.md` et `design-tokens.css`), puis `dev-front` | QA ciblée + critique (deuxième passage) |
| Structure | nouvelle page, nouvelle section, navigation | `redacteur` et `designer` si besoin (en parallèle), puis `dev-front` | QA complète + critique |
| Domaine | « mettez le site sur monsite.bj » | `devops` seul (section « Nom de domaine » : association, enregistrements DNS à donner au client, URL du site mise à jour, redéploiement) | contrôle DNS et HTTPS du script `domaine.mjs` |
| Fonctionnalité | formulaire, paiement, réservation en ligne, données | `architecte` (complète `02-architecture.md`), puis `dev-front` et/ou `dev-back` | QA complète + **Sécurité** + vérificateur |

- Pas de montée de version majeure du framework ou d'une dépendance dans une modification, sauf si elle est indispensable pour la réaliser. Dans ce cas, annonce-la au client (en mode automatique, note-la dans `decisions_auto`), et elle déclenche la Sécurité.
- Une modification qui touche du code serveur, un formulaire, des dépendances npm ou des scripts tiers déclenche **toujours** l'agent `securite`.
- En mode interactif, annonce au client en une phrase ce que tu vas faire (agents et contrôles), puis lance.
- Donne à chaque agent la consigne précise : « Modification n°<n> : <demande>. Ne change que ce qui est nécessaire. » Le rédacteur utilise `00-faits.md` s'il existe, et liste les `[À COMPLÉTER]` restants.

## Étape 3 : contrôles

Lance les contrôles retenus, en parallèle quand c'est possible (QA et Sécurité ; critique et vérificateur).
- La **QA ciblée** suit le mode « itération ≥ 2 » de l'agent QA : tu lui donnes la liste des pages et des éléments modifiés comme « défauts à revérifier », plus le contrôle de non-régression.
- Boucle de correction limitée à 2 itérations. Au-delà, présente au client ce qui reste.
- **Aucune mise en ligne si la Sécurité, lancée, ne répond pas AUTORISE.**

## Étape 4 : validation et remise en ligne

1. ✋ Montre au client ce qui a changé : liste courte des changements, captures avant/après des pages touchées (`.qa/`), nombre de `[À COMPLÉTER]` avant/après, verdicts des contrôles. Options : « Mettre en ligne », « Modifier encore », « Annuler la modification ». En mode automatique : mise en ligne en brouillon seulement.
2. Lance `workflow-ia:devops` avec le `site_id` de `etat.json`, pour redéployer **le même site** : même mode qu'avant (production si le site était en production, sauf choix contraire du client).
3. Mets à jour `etat.json` (statut de la modification, nouvelle URL de déploiement) et ajoute une entrée à `12-modifications.md` : date, demande, agents lancés, fichiers modifiés, verdicts, URL.

## Annuler une modification

Si le client demande d'annuler : si `site/` est un dépôt git, reviens au commit précédant la modification (`git -C <site> revert`), sinon demande au `dev-front` de rétablir l'état décrit dans l'entrée précédente de `12-modifications.md`. Puis contrôles et remise en ligne comme ci-dessus.

## Fin

Bilan en quelques lignes : ce qui a changé, l'URL, ce qui reste à compléter, et la prochaine modification conseillée.
