---
name: creer-site
description: Crée un site web complet à partir d'un seul prompt, du cahier des charges jusqu'au déploiement sur Netlify, en pilotant une équipe de 11 agents spécialisés (brainstorming, architecte, designer, rédacteur, dev front, dev back, QA, sécurité, critique, vérificateur, DevOps). Utiliser quand l'utilisateur veut créer, générer ou lancer un site web, une landing page, un site vitrine ou un portfolio, ou reprendre un projet de site existant dans sites/.
argument-hint: "<description du site>" [--auto] | reprendre <slug>
---

# Créer un site web en un prompt

Tu es l'**orchestrateur** de l'agence. Tu ne produis aucun livrable toi-même : tu lances les agents, tu fais circuler leurs livrables, tu tiens `etat.json` à jour et tu demandes au client de valider aux trois moments clés. Parle au client en français simple, sans jargon.

Demande du client : $ARGUMENTS

Conventions partagées par tous les agents : `${CLAUDE_PLUGIN_ROOT}/skills/creer-site/references/conventions.md`. Lis-les avant de commencer.

## Règles d'orchestration

- **Lance chaque agent avec l'outil Agent**, `subagent_type` = `workflow-ia:<agent>` (par exemple `workflow-ia:brainstorming`). Donne-lui toujours : le chemin absolu du dossier projet, ce qu'il doit produire, et les éventuelles corrections à traiter.
- **Lis la ligne de statut** à la fin de la réponse de chaque agent (voir les conventions) et vérifie que son fichier existe avant de passer à l'étape suivante. Si un agent échoue, relance-le une fois avec l'erreur ; au deuxième échec, explique le problème au client et demande-lui quoi faire.
- **Mets à jour `etat.json` après chaque étape**, pas seulement à la fin :
  `{ "slug": "...", "mode": "interactif|auto", "etape": "<nom>", "statut": "en_cours|termine|en_attente_client|bloque", "iterations_qa": 0, "iterations_securite": 0, "iterations_revue": 0, "dev_back": false, "url": null, "decisions_auto": [], "historique": [ { "etape": "...", "date": "...", "resultat": "..." } ] }`
- **Validations du client** : utilise l'outil AskUserQuestion avec des options claires, ta recommandation en premier. N'avance jamais au-delà d'un point de validation sans réponse (sauf en mode automatique).
- **Boucles de correction limitées** : 3 itérations pour la QA, 3 pour la Sécurité, 1 pour la revue finale. Au-delà, arrête et présente au client ce qui reste, avec ta recommandation.
- Tiens le client informé en une ligne à chaque étape (« Étape 3/8 : le designer prépare la charte graphique »).

## Mode automatique

Le mode automatique s'active si `$ARGUMENTS` contient `--auto` (retire-le de la description), ou si l'outil AskUserQuestion n'est pas disponible (session non interactive). Dans ce mode :

- à chaque question ou validation, choisis toi-même l'option que tu aurais recommandée, et ajoute-la à `decisions_auto` dans `etat.json` (étape, question, choix, raison) ;
- ne lance jamais le scan approfondi `/claude-security` ;
- mets en ligne seulement si `NETLIFY_AUTH_TOKEN` est défini, et toujours en **brouillon** (jamais `--prod`), sans repo GitHub ;
- **ne t'arrête jamais pour demander quelque chose** : personne ne répondra. Si une commande est refusée, demande à l'agent concerné une autre méthode autorisée (un outil Read/Write au lieu de `cp`, une commande simple au lieu d'un enchaînement). Si une vérification reste impossible, l'agent l'écrit comme **réserve** dans son rapport, et tu passes à l'étape suivante. Une réserve n'est jamais un blocage en mode automatique ; seuls un build en échec ou un verdict Sécurité BLOQUE arrêtent le pipeline ;
- termine par le bilan, en listant toutes les décisions prises à la place du client et toutes les réserves.

## Étape 0 : préparation

1. Si `$ARGUMENTS` commence par `reprendre`, lis `sites/<slug>/etat.json` et reprends à l'étape indiquée. Si le slug n'est pas donné, liste les dossiers de `sites/` et demande lequel reprendre.
2. Si la description est vide, demande au client de décrire son site en une ou deux phrases (type, activité, objectif, ville ou pays).
3. Vérifie les prérequis : `bash "${CLAUDE_PLUGIN_ROOT}/skills/creer-site/scripts/prerequis.sh"`. Si un outil obligatoire manque, explique comment l'installer et arrête-toi. Les manques optionnels (gh, Netlify) sont signalés et le travail continue.
4. Choisis un slug à partir de la demande, crée `sites/<slug>/`, écris `00-demande.md` (le prompt exact) et `etat.json`.

## Étape 1/8 : cahier des charges (agent `brainstorming`)

1. Lance `workflow-ia:brainstorming`.
2. S'il répond `QUESTIONS_EN_ATTENTE`, lis `01-questions.md`, pose les questions au client avec AskUserQuestion (4 questions maximum par appel), écris ses réponses dans `01-reponses.md`, puis relance l'agent.
3. ✋ **Validation 1** : résume `01-brief.md` au client (objectif, pages, fonctionnalités, hors MVP) et demande : « Valider », « Modifier » (il dit quoi ; relance l'agent avec ses remarques), « Annuler ».

## Étape 2/8 : architecture (agent `architecte`)

Lance `workflow-ia:architecte`. Note `dev_back` dans `etat.json` d'après sa ligne `DEV_BACK`. Résume la stack au client en une phrase, sans demander de validation.

## Étape 3/8 : design et contenus (agents `designer` et `redacteur`, en parallèle)

1. Lance `workflow-ia:designer` et `workflow-ia:redacteur` **dans le même message**, pour qu'ils travaillent en parallèle.
2. ✋ **Validation 2** : présente la direction visuelle (style, couleurs en hex, polices), les titres principaux de la page d'accueil et la liste des `[À COMPLÉTER]`. Propose au client de fournir tout de suite les informations manquantes (adresse, horaires, prix…). Options : « Valider », « Modifier le design », « Modifier les textes ». En cas de modification, relance seulement l'agent concerné avec les remarques.
3. Si le client donne des informations manquantes, demande au rédacteur de les intégrer dans `04-contenu.md`.

## Étape 4/8 : développement (agents `dev-front`, puis `dev-back` si besoin)

1. Lance `workflow-ia:dev-front`. Attends `BUILD: OK`.
2. Si `dev_back` est vrai, lance ensuite `workflow-ia:dev-back`. Attends `BACK: OK`.

## Étape 5/8 : tests et performance mobile (agent `qa`, boucle de correction)

1. Lance `workflow-ia:qa` avec le numéro d'itération.
2. Si `QA: A_CORRIGER` : transmets la liste des corrections à `workflow-ia:dev-front` (ou `dev-back` si elles concernent les fonctions serveur), puis relance `qa`. Incrémente `iterations_qa`. Maximum 3 itérations.

## Étape 6/8 : sécurité (agent `securite`, boucle de correction)

1. Lance `workflow-ia:securite` avec le numéro d'itération.
2. Si `SECURITE: BLOQUE` : transmets les corrections au développeur concerné, relance `qa` une fois pour vérifier qu'il n'y a pas de régression, puis relance `securite`. Incrémente `iterations_securite`. Maximum 3 itérations. **Aucun déploiement tant que le verdict n'est pas AUTORISE.**
3. Si le rapport recommande un scan approfondi, propose-le au client en précisant qu'il consomme beaucoup de tokens. S'il accepte, lance la commande `/claude-security` sur `sites/<slug>/site`, puis transmets les failles confirmées au développeur.

## Étape 7/8 : revue finale (agents `critique` et `verificateur`, en parallèle)

1. Lance `workflow-ia:critique` et `workflow-ia:verificateur` **dans le même message**. Ne transmets au critique que le chemin du dossier projet, sans résumé du travail : son regard doit rester neuf.
2. Si `CRITIQUE: HOLD` ou `VERIFICATION: A_CORRIGER` : regroupe leurs exigences en une seule liste, transmets-la au développeur concerné, puis relance `qa` une fois pour éviter les régressions. Relance ensuite les deux agents de revue une seule fois (`iterations_revue` = 1).
3. Si un point reste ouvert après ce tour, ne boucle pas : présente-le au client à la validation 3, avec ta recommandation.

## Étape 8/8 : mise en ligne (agent `devops`)

1. ✋ **Validation 3** : montre au client l'aperçu local (donne la commande `cd sites/<slug>/site && npm run preview`), les captures de `.qa/` et `.qa/critique/`, les verdicts QA, Sécurité, Critique et Vérification, les mesures de performance mobile, et les `[À COMPLÉTER]` restants. Demande : « Mettre en ligne (production) », « Mettre en ligne en brouillon », « Pas encore ». Demande aussi s'il veut un repo GitHub pour le code.
2. Lance `workflow-ia:devops` avec ses choix.
3. Si `DEPLOIEMENT: EN_ATTENTE` (jeton Netlify absent, par exemple), explique au client exactement quoi faire, puis comment reprendre : `/workflow-ia:creer-site reprendre <slug>`.

## Fin

Présente un bilan court : URL en ligne, ce qui a été construit, les scores de performance mobile, les `[À COMPLÉTER]` restants, les prochaines étapes conseillées (nom de domaine, images réelles, notifications des formulaires) et, en mode automatique, les décisions prises à la place du client. Mets `etat.json` à `termine`.

Propose enfin, en option, une amélioration continue : le skill `adaptive-agent:skill-review` peut analyser la session pour améliorer les skills de l'équipe.
