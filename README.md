# Apprendre les workflows IA : un générateur de fiches produits

Le projet : une boutique d'articles vintage a des notes brutes de vendeur
(« veste jean levis annees 80, petit accroc poche gauche… ») et veut des
fiches produits propres, honnêtes et prêtes à publier.

On construit la solution **étape par étape**. Chaque étape ajoute un nouveau
schéma de workflow, avec un script court qu'on peut lancer et modifier.

## Installation

```bash
python -m venv .venv
source .venv/bin/activate        # Windows : .venv\Scripts\activate
pip install -r requirements.txt
export ANTHROPIC_API_KEY="sk-ant-..."   # clé créée sur https://platform.claude.com
```

Chaque étape se lance depuis la racine du projet :

```bash
python -m etapes.e01_appel_simple
```

## Workflow ou agent ?

| | **Workflow** (étapes 1 à 6) | **Agent** (étape 7) |
|---|---|---|
| Qui décide de l'ordre des étapes ? | Ton code | Le modèle |
| Prévisibilité | Forte | Plus faible |
| Coût et rapidité | Maîtrisés | Variables, souvent plus élevés |
| Quand l'utiliser ? | Le chemin peut être écrit à l'avance | Le chemin dépend de ce qu'on découvre en route |

Règle d'or : **commence par la solution la plus simple**. Un seul appel bien
écrit suffit souvent. On ajoute des étapes seulement quand elles améliorent
vraiment le résultat.

## Le parcours

| Étape | Fichier | Ce que tu apprends |
|---|---|---|
| 1 | `etapes/e01_appel_simple.py` | Un appel à Claude, le rôle du prompt système |
| 2 | `etapes/e02_sortie_structuree.py` | Obtenir des données fiables (Pydantic) au lieu de texte libre |
| 3 | `etapes/e03_chainage.py` | **Chaînage** : découper en étapes, avec des contrôles en Python entre elles |
| 4 | `etapes/e04_routage.py` | **Routage** : classer, puis envoyer vers un prompt spécialisé |
| 5 | `etapes/e05_parallelisation.py` | **Parallélisation** : traiter plusieurs produits en même temps |
| 6 | `etapes/e06_evaluateur_optimiseur.py` | **Évaluateur-optimiseur** : rédiger, relire avec une grille, corriger |
| 7 | `etapes/e07_agent.py` | **Agent** : Claude choisit lui-même ses outils pour accomplir un objectif |

### Étape 1 — Un seul appel

La brique de base. Remarque le **prompt système** : il fixe le rôle et les
règles (ici, « signaler les défauts »). Change-le et observe la différence.

### Étape 2 — Sortie structurée

`FicheProduit` (dans `fiches/modeles.py`) définit les champs attendus. Claude
est contraint de répondre dans ce format : plus besoin de découper du texte.
C'est ce qui permet de **brancher** un appel IA sur la suite de ton programme.

### Étape 3 — Chaînage

```
notes ──► extraire les faits ──► [contrôle Python] ──► rédiger ──► post Instagram
```

Pourquoi découper ? Chaque étape est plus simple, donc plus fiable, et tu peux
vérifier le résultat intermédiaire. Le rédacteur ne reçoit que les faits
extraits, ce qui limite les inventions. Le contrôle (`controler`) est du code
classique : s'il détecte un article abîmé, la chaîne s'arrête.

### Étape 4 — Routage

Un premier appel classe le produit (vêtement, déco, accessoire), puis ton code
choisit le bon spécialiste. Chaque prompt spécialisé reste court et ciblé.

### Étape 5 — Parallélisation

Les produits sont indépendants : on les traite en même temps avec un
`ThreadPoolExecutor`. Même résultat, beaucoup plus vite.

### Étape 6 — Évaluateur-optimiseur

Un rédacteur écrit, un relecteur note la fiche avec une **grille précise**, et
on recommence avec ses remarques. Deux points clés :
- la grille est concrète et vérifiable (« 70 caractères max »), pas « fais mieux » ;
- le nombre de tours est **limité** (`MAX_TOURS`) pour éviter une boucle sans fin.

### Étape 7 — Agent avec outils

Claude reçoit un objectif (« publie les fiches manquantes ») et quatre outils
Python : lister les produits, lire les notes, consulter les prix du marché,
enregistrer une fiche. Il décide seul de l'enchaînement. Les fiches finales
sont écrites dans `sortie/`. Relance le script : l'agent voit qu'il n'y a plus
rien à faire.

Remarque que l'outil `enregistrer_fiche` **vérifie** la longueur du titre et
renvoie une erreur explicite : l'agent la lit et corrige lui-même.

## Organisation du code

```
fiches/commun.py    client, modèle, fonctions demander() et demander_structure()
fiches/modeles.py   formats de données (Pydantic)
donnees/produits.json   les notes brutes des 4 produits d'exemple
etapes/             un script par étape
```

Tous les appels passent par `fiches/commun.py`. On y règle :
- `MODELE` : le modèle Claude utilisé ;
- `effort` : combien Claude réfléchit (`low` pour les tâches simples,
  `medium` pour la relecture et l'agent) ;
- le **repli automatique** (`fallbacks`) : si une requête est déclinée par les
  filtres de sécurité, l'API la relance sur un autre modèle.

## Exercices

1. **Étape 1** — Ajoute tes propres produits dans `donnees/produits.json`.
2. **Étape 2** — Ajoute un champ `conseil_entretien: str` à `FicheProduit`.
3. **Étape 3** — Ajoute une 4ᵉ étape qui traduit la fiche en anglais.
4. **Étape 4** — Crée une catégorie « bijoux » avec son spécialiste.
5. **Étape 6** — Ajoute un critère à la grille et observe combien de tours il faut.
6. **Étape 7** — Ajoute un outil `lire_photo` qui envoie une image du produit
   à Claude (voir la documentation « vision » du SDK).
7. **Bonus** — Combine tout : routage → chaînage → évaluateur, en parallèle
   sur tous les produits. C'est un vrai pipeline de production.

## Pour aller plus loin

- Documentation de l'API : https://platform.claude.com/docs
- Article de référence sur ces schémas : « Building effective agents » (Anthropic)
