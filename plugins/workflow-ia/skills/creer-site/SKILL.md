---
name: creer-site
description: Crée un site web complet à partir d'un seul prompt, du cahier des charges jusqu'au déploiement sur Netlify, en pilotant une équipe de 11 agents spécialisés (brainstorming, architecte, designer, rédacteur, dev front, dev back, QA, sécurité, critique, vérificateur, DevOps). Utiliser quand l'utilisateur veut créer, générer ou lancer un site web, une landing page, un site vitrine ou un portfolio, ou reprendre un projet de site existant dans sites/.
argument-hint: "<description du site>" [--sources <fichiers ou URL>] [--auto] [--premium] | reprendre <slug>
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
- Toi aussi, respecte la règle 9 des conventions : une commande simple par appel, jamais d'enchaînement (`cd … && …`, `;`). Pour lire un fichier, utilise Read ; pour lister, Glob ; pour chercher, Grep. Un enchaînement refusé fait perdre une vérification entière.
- Tiens le client informé en une ligne à chaque étape (« Étape 3/8 : le designer prépare la charte graphique »).

## Budget et sobriété

- Le collecteur, le rédacteur et le développeur lisent `00-faits.md` eux-mêmes : ne le recopie pas dans tes consignes.
- Chaque agent a un modèle par défaut adapté à sa tâche (Sonnet pour la plupart, Haiku pour le DevOps). Si `$ARGUMENTS` contient `--premium` (retire-le de la description), passe `model: "opus"` à l'outil Agent pour `designer`, `dev-front`, `securite` et `critique` : meilleure qualité, coût environ doublé. Note le mode dans `etat.json`.
- Toi aussi, tu es facturé à chaque tour. Ne lis pas les livrables en entier : pour résumer au client, lis seulement les sections utiles (verdict, liste des corrections) avec `Grep` ou `Read` limité. Ne relis pas un fichier déjà lu.
- Transmets aux agents des consignes courtes : le chemin du dossier projet, l'itération, la liste des corrections. Ils lisent eux-mêmes les livrables.
- Pendant qu'un agent travaille, attends sa fin sans relancer de commandes de vérification.

## Mode automatique

Le mode automatique s'active si `$ARGUMENTS` contient `--auto` (retire-le de la description), ou si l'outil AskUserQuestion n'est pas disponible (session non interactive). Dans ce mode :

- à chaque question ou validation, choisis toi-même l'option que tu aurais recommandée, et ajoute-la à `decisions_auto` dans `etat.json` (étape, question, choix, raison) ;
- ne lance jamais le scan approfondi `/claude-security` ;
- mets en ligne toujours en **brouillon** (jamais `--prod`), sans repo GitHub. Ne vérifie pas toi-même le jeton Netlify (une commande qui lit une variable est refusée) : lance le DevOps, son script répond `EN_ATTENTE` si le jeton manque ;
- **ne t'arrête jamais pour demander quelque chose** : personne ne répondra. Si une commande est refusée, demande à l'agent concerné une autre méthode autorisée (un outil Read/Write au lieu de `cp`, une commande simple au lieu d'un enchaînement). Si une vérification reste impossible, l'agent l'écrit comme **réserve** dans son rapport, et tu passes à l'étape suivante. Une réserve n'est jamais un blocage en mode automatique ; seuls un build en échec ou un verdict Sécurité BLOQUE arrêtent le pipeline ;
- termine par le bilan, en listant toutes les décisions prises à la place du client et toutes les réserves.

## Étape 0 : préparation

1. Si `$ARGUMENTS` commence par `reprendre`, lis `sites/<slug>/etat.json` et reprends à l'étape indiquée. Si le slug n'est pas donné, liste les dossiers de `sites/` et demande lequel reprendre.
2. Si la description est vide, demande au client de décrire son site en une ou deux phrases (type, activité, objectif, ville ou pays).
3. Vérifie les prérequis : `bash "${CLAUDE_PLUGIN_ROOT}/skills/creer-site/scripts/prerequis.sh"`. Si un outil obligatoire manque, explique comment l'installer et arrête-toi. Les manques optionnels (gh, Netlify) sont signalés et le travail continue.
4. Choisis un slug à partir de la demande, crée `sites/<slug>/`, écris `00-demande.md` (le prompt exact) et `etat.json`.
5. **Éléments existants du client.** S'il a donné `--sources` (fichiers, URL) ou collé du contenu dans sa demande, garde-les. Sinon, en mode interactif, demande-lui s'il a déjà des éléments (photos, menu ou catalogue, flyer, documents, page Facebook ou fiche Google, ancien site) **dans le même message que la fiche express** ci-dessous : une seule question au client, pas deux.
6. **Fiche express** (mode interactif seulement, sauf si les sources contiennent déjà ces informations). Avant tout travail d'agent, pose **une seule question, en texte libre** dans ton message (pas avec AskUserQuestion), puis attends la réponse :

   > Pour que votre site soit complet dès la première version, donnez-moi ce que vous avez (le reste pourra attendre) :
   > 1. le nom exact de votre activité ;
   > 2. votre numéro WhatsApp et/ou de téléphone ;
   > 3. votre adresse : ville, quartier, point de repère ;
   > 4. vos horaires ;
   > 5. vos principaux produits ou services, avec les prix si vous voulez les afficher ;
   > 6. vos réseaux sociaux ou votre e-mail ;
   > 7. si vous en avez : photos, menu, flyer, page Facebook, ancien site (indiquez où sont les fichiers, ou le lien).
   >
   > Répondez « plus tard » pour passer cette étape.

   Adapte la liste à l'activité : pour un événement, demande les dates, le lieu et la billetterie ; pour une association, l'objet et le moyen de don. Enregistre la réponse telle quelle dans `sources/texte-client.md`. Elle passe ensuite par le collecteur, comme les autres sources. Ne repose pas plus tard une question à laquelle le client a répondu ici.
7. S'il y a des sources rangées hors du dossier de travail, copie-les d'abord dans `sites/<slug>/sources/` (voir « Fichiers rangés ailleurs » dans `${CLAUDE_PLUGIN_ROOT}/skills/modifier-site/SKILL.md`).
8. S'il y a des sources (y compris la fiche express), lance `workflow-ia:collecteur` (texte collé enregistré dans `sources/texte-client.md`). Résume ce qui a été trouvé et, en mode interactif, fais trancher les conflits. Tous les agents suivants liront `00-faits.md`.

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

## Étapes 5 et 6/8 : tests et sécurité (agents `qa` et `securite`, en parallèle)

QA et Sécurité lisent le même build sans le modifier : lance-les **dans le même message**, avec le numéro d'itération.

1. Si `QA: A_CORRIGER` ou `SECURITE: BLOQUE` : fusionne leurs listes en **une seule** liste de corrections (sécurité d'abord), transmets-la au développeur concerné (`dev-front`, ou `dev-back` pour les fonctions serveur), puis relance seulement le ou les agents qui avaient des remarques, en indiquant l'itération : en itération ≥ 2, la QA fait une **re-vérification ciblée** (voir son agent). Incrémente `iterations_qa` et `iterations_securite`. Maximum 3 itérations chacun.
2. **Aucun déploiement tant que le verdict Sécurité n'est pas AUTORISE.**
3. Si le rapport Sécurité recommande un scan approfondi, propose-le au client en précisant qu'il consomme beaucoup de tokens. S'il accepte, lance la commande `/claude-security` sur `sites/<slug>/site`, puis transmets les failles confirmées au développeur.

## Étape 7/8 : revue finale (agents `critique` et `verificateur`, en parallèle)

1. Lance `workflow-ia:critique` et `workflow-ia:verificateur` **dans le même message**. Ne transmets au critique que le chemin du dossier projet, sans résumé du travail : son regard doit rester neuf.
2. Si `CRITIQUE: HOLD` ou `VERIFICATION: A_CORRIGER` : regroupe leurs exigences en une seule liste, transmets-la au développeur concerné, puis relance en parallèle, une seule fois et en **deuxième passage** (ciblé), seulement les agents de revue qui avaient des remarques (`iterations_revue` = 1). Le vérificateur contrôle lui-même l'absence de régression : pas de QA supplémentaire.
3. Si un point reste ouvert après ce tour, ne boucle pas : présente-le au client à la validation 3, avec ta recommandation.

## Étape 8/8 : mise en ligne (agent `devops`)

1. ✋ **Validation 3** : montre au client l'aperçu local (donne la commande `cd sites/<slug>/site && npm run preview`), les captures de `.qa/` et `.qa/critique/`, les verdicts QA, Sécurité, Critique et Vérification, les mesures de performance mobile, et les `[À COMPLÉTER]` restants. Demande : « Mettre en ligne (production) », « Mettre en ligne en brouillon », « Pas encore ». S'il reste des `[À COMPLÉTER]` visibles et que le client choisit la production, montre-lui la liste et demande-lui de les compléter maintenant (tu les transmets au rédacteur et au dev-front), ou de confirmer qu'il publie quand même. Seule cette confirmation explicite autorise le DevOps à utiliser `--accepter-incomplet`. Demande aussi s'il veut un repo GitHub pour le code.
2. Lance `workflow-ia:devops` avec ses choix.
3. Note dans `etat.json` le `site_id`, l'URL et le mode (`brouillon` ou `production`) donnés par la ligne `DEPLOIEMENT:` : `/workflow-ia:modifier-site` redéploiera au même endroit.
4. Si `DEPLOIEMENT: EN_ATTENTE` (jeton Netlify absent, par exemple), explique au client exactement quoi faire, puis comment reprendre : `/workflow-ia:creer-site reprendre <slug>`.

## Fin

Présente un bilan court : URL en ligne, comment faire évoluer le site (`/workflow-ia:modifier-site <slug> "<demande>"`, avec `--sources` pour donner photos ou documents), ce qui a été construit, les scores de performance mobile, les `[À COMPLÉTER]` restants, les prochaines étapes conseillées (nom de domaine : `/workflow-ia:modifier-site <slug> "Mets le site sur monsite.bj"` une fois le domaine acheté, images réelles, notifications des formulaires) et, en mode automatique, les décisions prises à la place du client. Mets `etat.json` à `termine`.

Propose enfin, en option, une amélioration continue : le skill `adaptive-agent:skill-review` peut analyser la session pour améliorer les skills de l'équipe.
