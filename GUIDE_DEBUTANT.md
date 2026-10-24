# Guide du débutant : chaque fichier expliqué

Ce guide explique chaque fichier du projet, ligne par ligne quand c'est utile.
Il suppose que tu débutes en Python : les notions de base sont présentées dans
la partie 0, puis réexpliquées quand elles apparaissent dans le code.

**Conseil de lecture :** ouvre le fichier dans ton éditeur à côté de ce guide,
et lis les deux en même temps.

Sommaire :

- [0. Les notions Python à connaître](#0-les-notions-python-à-connaître)
- [1. Vue d'ensemble du projet](#1-vue-densemble-du-projet)
- [2. Les fichiers de configuration](#2-les-fichiers-de-configuration)
- [3. `donnees/produits.json` : les données](#3-donneesproduitsjson--les-données)
- [4. `fiches/commun.py` : la boîte à outils](#4-fichescommunpy--la-boîte-à-outils)
- [5. `fiches/modeles.py` : les formats de réponse](#5-fichesmodelespy--les-formats-de-réponse)
- [6. Les étapes 1 à 7](#6-étape-1--e01_appel_simplepy)
- [13. Glossaire](#13-glossaire)

---

## 0. Les notions Python à connaître

Pas besoin de tout retenir maintenant : reviens ici quand tu bloques.

### Variables et types

```python
nom = "lampe"          # str  : du texte, entre guillemets
prix = 25              # int  : un nombre entier
poids = 1.5            # float: un nombre à virgule (avec un point !)
disponible = True      # bool : True (vrai) ou False (faux)
rien = None            # None : « pas de valeur »
```

### Listes : une suite d'éléments, dans l'ordre

```python
couleurs = ["bleu", "jaune", "rouge"]
couleurs[0]            # "bleu"  — on compte à partir de 0 !
couleurs.append("vert")  # ajoute un élément à la fin
len(couleurs)          # 4 : le nombre d'éléments
```

### Dictionnaires : des paires « clé → valeur »

```python
produit = {"id": "P001", "prix_achat": 18}
produit["id"]          # "P001"
produit.get("couleur") # None, car la clé n'existe pas (pas d'erreur)
```

### Les f-strings : insérer des variables dans du texte

Un `f` devant les guillemets permet de mettre des variables entre `{}` :

```python
prix = 25
print(f"Le prix est de {prix} €")   # Le prix est de 25 €
print(f"{3.14159:.1f}")              # 3.1 : « :.1f » = 1 chiffre après la virgule
```

`\n` dans un texte signifie « retour à la ligne ».

### Fonctions

```python
def saluer(nom):           # def = « je définis une fonction »
    return f"Bonjour {nom}"  # return = ce que la fonction renvoie

message = saluer("Andy")   # on l'appelle
```

L'**indentation** (les espaces en début de ligne) est obligatoire en Python :
c'est elle qui indique ce qui fait partie de la fonction, d'une boucle ou d'un `if`.

### Les annotations de type (les `: str` et `-> list`)

Dans le projet, tu verras :

```python
def demander(prompt: str, *, systeme: str | None = None) -> str:
```

- `prompt: str` : « prompt est censé être du texte ». C'est une indication pour
  les humains et l'éditeur ; Python ne bloque pas si tu te trompes.
- `-> str` : « cette fonction renvoie du texte ».
- `str | None` : « du texte, ou None ».
- `= None` : valeur par défaut si on ne donne rien.
- `*` seul : tout ce qui vient après doit être donné **avec son nom**,
  par exemple `demander("...", systeme="...")`. Ça rend le code plus lisible.

### Conditions et boucles

```python
if prix > 50:
    print("cher")
elif prix > 20:            # « sinon si »
    print("moyen")
else:
    print("pas cher")

for couleur in couleurs:   # répète pour chaque élément de la liste
    print(couleur)

for i in range(1, 4):      # i vaut 1, puis 2, puis 3 (le 4 est exclu)
    print(i)
```

### Importer du code

```python
import json                        # importe tout le module json
from pathlib import Path           # importe seulement Path depuis pathlib
from fiches.commun import demander # importe depuis NOTRE fichier fiches/commun.py
```

Un **module** est simplement un fichier `.py`. Un **paquet** est un dossier de
modules (qui contient un fichier `__init__.py`).

### Classes et objets (juste ce qu'il faut)

Une **classe** est un « moule » qui décrit la forme d'un objet. Un **objet** est
une chose fabriquée avec ce moule. On accède à ses informations avec un point :

```python
fiche.titre        # l'attribut « titre » de l'objet fiche
fiche.model_dump_json()  # une « méthode » : une fonction rattachée à l'objet
```

### `if __name__ == "__main__":`

Tu le verras à la fin de chaque étape :

```python
if __name__ == "__main__":
    main()
```

Ça veut dire : « lance `main()` seulement si on exécute ce fichier directement ».
Si un autre fichier fait `import` de celui-ci (l'étape 5 importe l'étape 3),
`main()` ne se lance **pas** : on récupère juste ses fonctions.

---

## 1. Vue d'ensemble du projet

```
workflow-ia/
├── README.md              présentation du projet et du parcours
├── GUIDE_DEBUTANT.md      ce guide
├── requirements.txt       liste des bibliothèques à installer
├── .gitignore             fichiers que git doit ignorer
├── donnees/
│   └── produits.json      les notes brutes des 4 produits
├── fiches/                le code partagé
│   ├── __init__.py        fait de « fiches » un paquet importable
│   ├── commun.py          connexion à Claude + fonctions d'appel
│   └── modeles.py         formats des réponses attendues
└── etapes/                un script par leçon
    ├── __init__.py
    ├── e01_appel_simple.py
    ├── e02_sortie_structuree.py
    ├── e03_chainage.py
    ├── e04_routage.py
    ├── e05_parallelisation.py
    ├── e06_evaluateur_optimiseur.py
    └── e07_agent.py
```

**Le principe :** le code qui sert partout (se connecter à Claude, poser une
question) est écrit **une seule fois** dans `fiches/`. Les scripts de `etapes/`
l'importent et se concentrent sur la leçon du jour.

**Pourquoi lancer avec `python -m etapes.e01_appel_simple` ?**
Le `-m` dit à Python : « lance le module `e01_appel_simple` du paquet
`etapes`, en partant du dossier où je suis ». Comme tu es à la racine du
projet, Python trouve aussi le paquet `fiches` et les lignes
`from fiches.commun import ...` fonctionnent. Si tu lançais
`python etapes/e01_appel_simple.py`, Python chercherait `fiches` dans le
dossier `etapes/` et afficherait `ModuleNotFoundError`.

---

## 2. Les fichiers de configuration

### `requirements.txt`

```
anthropic>=2.3.0
pydantic>=2
```

La liste des **bibliothèques externes** (du code écrit par d'autres) dont le
projet a besoin. `pip install -r requirements.txt` les installe toutes.

- **anthropic** : le SDK officiel pour parler à Claude. Il s'occupe de la
  connexion internet, des erreurs, des nouvelles tentatives, etc.
- **pydantic** : sert à décrire et vérifier la forme des données (voir `modeles.py`).
- `>=2.3.0` : « version 2.3.0 ou plus récente ».

### `.gitignore`

```
__pycache__/
.venv/
.env
sortie/
```

Les fichiers et dossiers que git ne doit **jamais** enregistrer :

- `__pycache__/` : fichiers temporaires que Python crée tout seul pour aller plus vite.
- `.venv/` : ton environnement virtuel (les bibliothèques installées). Lourd et
  propre à ton ordinateur.
- `.env` : si un jour tu y ranges ta clé API, elle ne sera jamais publiée sur GitHub.
  **Une clé API ne doit jamais être dans le code ni sur GitHub.**
- `sortie/` : les fiches générées par l'agent de l'étape 7.

### `fiches/__init__.py` et `etapes/__init__.py`

Ces fichiers sont **vides**, et c'est normal. Leur simple présence dit à Python :
« ce dossier est un paquet, on peut importer ses fichiers ».

---

## 3. `donnees/produits.json` : les données

```json
[
  {
    "id": "P001",
    "notes": "veste jean levis 70505 annees 80, bien delavee, taille M, ...",
    "prix_achat": 18
  },
  ...
]
```

**JSON** est un format texte très répandu pour stocker des données. Il ressemble
beaucoup à Python :

- `[ ... ]` est une **liste** (ici, une liste de 4 produits) ;
- `{ ... }` est un **objet**, qui devient un **dictionnaire** en Python ;
- chaque produit a un identifiant (`id`), les notes brutes du vendeur (`notes`)
  et le prix auquel il a été acheté (`prix_achat`).

Les notes sont volontairement **mal écrites** (pas d'accents, abréviations) :
c'est la réalité d'un vendeur pressé, et c'est tout l'intérêt du projet de
transformer ça en belles fiches.

**À essayer :** ajoute ton propre produit. Attention à la syntaxe JSON : une
virgule entre deux produits, mais **pas** après le dernier, et des guillemets
doubles `"` obligatoires.

---

## 4. `fiches/commun.py` : la boîte à outils

C'est le fichier le plus important : **tous** les appels à Claude passent par lui.

### Les imports

```python
import json
from pathlib import Path

import anthropic
```

- `json` (fourni avec Python) : lire et écrire du JSON.
- `Path` (fourni avec Python) : manipuler des chemins de fichiers proprement,
  quel que soit le système (Windows, Mac, Linux).
- `anthropic` : le SDK installé avec `pip`.

Par convention, on met d'abord les modules fournis avec Python, une ligne vide,
puis les bibliothèques externes.

### Les constantes

```python
MODELE = "claude-opus-5-5"
```

Le nom du modèle Claude utilisé. Un nom tout en MAJUSCULES signale une
**constante** : une valeur qu'on ne change pas pendant l'exécution. Pour changer
de modèle dans tout le projet, tu modifies cette seule ligne.

```python
RACINE = Path(__file__).resolve().parent.parent
DOSSIER_SORTIE = RACINE / "sortie"
```

- `__file__` est une variable spéciale : le chemin du fichier en cours
  (ici `.../workflow-ia/fiches/commun.py`).
- `.resolve()` le transforme en chemin complet.
- `.parent` remonte d'un dossier : `.../workflow-ia/fiches`.
- `.parent` encore une fois : `.../workflow-ia`, la racine du projet.
- `RACINE / "sortie"` : avec `Path`, le `/` sert à **assembler des chemins**
  (ce n'est pas une division). Résultat : `.../workflow-ia/sortie`.

Pourquoi tant d'efforts ? Pour que le programme trouve ses fichiers **où qu'il
soit lancé**, sans écrire de chemin en dur comme `C:\Users\...`.

```python
OPTIONS_REPLI = {"betas": ["server-side-fallback-2026-07-01"], "fallbacks": "default"}
```

Un dictionnaire de réglages qu'on ajoutera à chaque appel. Il active le
**repli automatique** : si Claude refuse une requête à cause de ses filtres de
sécurité (ça peut arriver par erreur), l'API la relance toute seule sur un autre
modèle. `betas` active cette fonctionnalité, qui est encore en « bêta »
(récente). Tu n'as pas besoin de comprendre les détails pour débuter.

```python
client = anthropic.Anthropic()
```

On crée le **client** : l'objet qui sait parler à l'API de Claude. Sans
paramètre, il va chercher ta clé dans la variable d'environnement
`ANTHROPIC_API_KEY` (celle que tu as définie avec `export`). Il est créé une
seule fois, ici, puis réutilisé partout.

### `charger_produits()`

```python
def charger_produits() -> list[dict]:
    """Renvoie la liste des produits bruts (notes prises par le vendeur)."""
    chemin = RACINE / "donnees" / "produits.json"
    return json.loads(chemin.read_text(encoding="utf-8"))
```

- Le texte entre `"""` juste sous le `def` est une **docstring** : la
  documentation de la fonction. Elle ne fait rien à l'exécution.
- `chemin.read_text(encoding="utf-8")` lit tout le fichier sous forme de texte.
  `utf-8` est le codage qui gère correctement les accents.
- `json.loads(...)` transforme ce texte JSON en objets Python : ici une liste
  de dictionnaires.
- `-> list[dict]` annonce « je renvoie une liste de dictionnaires ».

### `verifier()`

```python
def verifier(reponse) -> None:
    if reponse.stop_reason == "refusal":
        raise RuntimeError(f"Claude a refusé la requête : {reponse.stop_details}")
    if reponse.stop_reason == "max_tokens":
        raise RuntimeError("Réponse coupée : augmente max_tokens.")
```

Chaque réponse de Claude indique **pourquoi** il s'est arrêté (`stop_reason`) :

| `stop_reason` | Signification |
|---|---|
| `end_turn` | Il a fini normalement : tout va bien |
| `refusal` | Il a refusé de répondre |
| `max_tokens` | Il a été coupé parce que la réponse était trop longue |
| `tool_use` | Il veut utiliser un outil (étape 7) |

`raise RuntimeError(...)` **déclenche une erreur** qui arrête le programme avec
un message clair. C'est mieux que de continuer avec une réponse vide ou coupée
et d'avoir un bug bizarre plus loin.

`-> None` : la fonction ne renvoie rien, elle ne fait que vérifier.

### `demander()` : poser une question, recevoir du texte

```python
def demander(prompt: str, *, systeme: str | None = None, effort: str = "low") -> str:
```

Trois paramètres :
- `prompt` : la question ou la consigne (obligatoire) ;
- `systeme` : le **prompt système** (facultatif, `None` par défaut), c'est-à-dire
  le rôle et les règles générales donnés à Claude ;
- `effort` : combien Claude réfléchit avant de répondre (`"low"` par défaut).

```python
    reponse = client.beta.messages.create(
        model=MODELE,
        max_tokens=16000,
        system=systeme if systeme else anthropic.omit,
        output_config={"effort": effort},
        messages=[{"role": "user", "content": prompt}],
        **OPTIONS_REPLI,
    )
```

C'est **l'appel à Claude**. Paramètre par paramètre :

- `model` : quel modèle utiliser.
- `max_tokens` : la longueur maximale de la réponse. Un **token** est un
  morceau de mot (environ 3 à 4 caractères). 16 000 tokens, c'est large.
- `system=systeme if systeme else anthropic.omit` : c'est une **condition sur
  une ligne**. Elle se lit : « donne `systeme` s'il existe, sinon
  `anthropic.omit` ». `anthropic.omit` signifie « n'envoie pas du tout ce
  paramètre ».
- `output_config={"effort": effort}` : le niveau de réflexion.
- `messages` : la conversation. C'est une liste de messages. Chacun a un
  `role` (`"user"` = toi, `"assistant"` = Claude) et un `content` (le texte).
  Ici, il n'y a qu'un message : ta consigne.
- `**OPTIONS_REPLI` : les deux étoiles **déballent** le dictionnaire. C'est
  comme si on avait écrit
  `betas=["server-side-fallback-2026-07-01"], fallbacks="default"`.

Pourquoi `client.beta.messages` et pas `client.messages` ? Parce que le repli
automatique est une fonctionnalité bêta, accessible par `beta`.

```python
    verifier(reponse)
    return "".join(bloc.text for bloc in reponse.content if bloc.type == "text")
```

- On vérifie que la réponse est utilisable.
- `reponse.content` est une **liste de blocs**. Une réponse peut contenir
  plusieurs types de blocs : du texte (`"text"`), de la réflexion
  (`"thinking"`), un appel d'outil (`"tool_use"`).
- `bloc.text for bloc in reponse.content if bloc.type == "text"` : « pour
  chaque bloc de la réponse, si c'est du texte, prends son texte ».
- `"".join(...)` colle tous ces morceaux bout à bout (avec `""`, rien entre eux).

Résultat : la fonction renvoie juste le texte de la réponse.

### `demander_structure()` : recevoir des données organisées

```python
def demander_structure(prompt: str, format_sortie, *, systeme: str | None = None, effort: str = "low"):
    reponse = client.beta.messages.parse(
        ...
        output_format=format_sortie,
        ...
    )
    verifier(reponse)
    return reponse.parsed_output
```

Presque identique à `demander()`, avec deux différences :

1. `messages.parse(...)` au lieu de `messages.create(...)`, avec
   `output_format=format_sortie`. On donne à Claude un **format obligatoire**
   (une classe de `modeles.py`, par exemple `FicheProduit`). Claude est alors
   contraint de répondre avec exactement ces champs.
2. On renvoie `reponse.parsed_output` : un **objet Python** déjà rempli et
   vérifié, au lieu d'un texte. Tu peux écrire directement `fiche.titre`.

---

## 5. `fiches/modeles.py` : les formats de réponse

```python
from typing import Literal

from pydantic import BaseModel
```

- `Literal` permet de dire « uniquement l'une de ces valeurs précises ».
- `BaseModel` est la classe de base de Pydantic.

### La classe `Attributs`

```python
class Attributs(BaseModel):
    """Les faits extraits des notes brutes du vendeur."""

    type_article: str
    marque: str | None
    epoque: str | None
    matieres: list[str]
    couleurs: list[str]
    dimensions_ou_taille: str | None
    etat: Literal["excellent", "très bon", "bon", "correct", "abîmé"]
    defauts: list[str]
```

- `class Attributs(BaseModel):` crée une classe qui **hérite** de `BaseModel` :
  elle récupère gratuitement tous les pouvoirs de Pydantic (vérification,
  conversion en JSON…).
- Chaque ligne `nom: type` déclare un **champ** :
  - `type_article: str` : du texte, obligatoire ;
  - `marque: str | None` : du texte **ou** `None`. Indispensable quand la
    marque n'est pas connue : on autorise Claude à dire « je ne sais pas »
    plutôt que de l'obliger à inventer ;
  - `matieres: list[str]` : une liste de textes (`["cuir", "laiton"]`) ;
  - `etat: Literal[...]` : seulement l'une des 5 valeurs listées. Ça permet
    ensuite au code de tester `if attributs.etat == "abîmé"` en étant sûr de
    l'orthographe.

### Les autres classes

- **`FicheProduit`** : la fiche finale (titre, accroche, description, points
  forts, mots-clés).
- **`Categorie`** : pour le routage de l'étape 4. `categorie` ne peut valoir que
  `"vetement"`, `"decoration"` ou `"accessoire"`. `justification` oblige Claude à
  expliquer son choix, pratique pour comprendre ses erreurs.
- **`Critique`** : le verdict du relecteur de l'étape 6 : une note, une liste de
  problèmes et `validee` (`True` ou `False`).

**Pourquoi c'est puissant :** ces classes servent à la fois de **consigne** pour
Claude (« remplis exactement ces champs ») et de **garantie** pour ton code (les
champs existent et ont le bon type).

---

## 6. Étape 1 : `e01_appel_simple.py`

**Objectif :** faire un seul appel à Claude.

```python
from fiches.commun import charger_produits, demander
```

On importe les deux fonctions dont on a besoin depuis notre boîte à outils.

```python
SYSTEME = (
    "Tu es rédacteur pour une boutique en ligne d'articles vintage. "
    "Ton style est chaleureux, précis et honnête : tu signales toujours les défauts."
)
```

Le **prompt système**. Les parenthèses permettent d'écrire un long texte sur
plusieurs lignes : Python **colle automatiquement** des textes placés côte à
côte. D'où l'espace à la fin de la première ligne, sinon on obtiendrait
« vintage.Ton ».

Le prompt système donne à Claude son **rôle** et ses **règles permanentes**.
Le message utilisateur, lui, donne la **tâche du moment**.

```python
def main():
    produit = charger_produits()[0]
```

On charge la liste des produits et on prend le premier (`[0]`), la veste en jean.

```python
    fiche = demander(
        f"Rédige une fiche produit à partir de ces notes du vendeur :\n\n{produit['notes']}",
        systeme=SYSTEME,
    )
    print(fiche)
```

- La f-string insère les notes du produit dans la consigne. `\n\n` crée une
  ligne vide entre la consigne et les notes, pour que ce soit clair pour Claude.
- Note les guillemets simples dans `produit['notes']` : la f-string utilise
  déjà des guillemets doubles, il faut donc des simples à l'intérieur.
- `print(fiche)` affiche le résultat dans le terminal.

**Ce qu'il faut retenir :** un appel = un prompt système + un message, et du
texte en retour. Tout le reste du projet est construit avec cette brique.

**À essayer :** supprime la phrase sur les défauts dans `SYSTEME`. Est-ce que
Claude mentionne encore l'accroc sur la poche ?

---

## 7. Étape 2 : `e02_sortie_structuree.py`

**Objectif :** recevoir des données utilisables par le code, pas du texte libre.

```python
from fiches.commun import charger_produits, demander_structure
from fiches.modeles import FicheProduit
```

On importe `demander_structure` et le format `FicheProduit`.

```python
SYSTEME = (
    "... "
    "Titre : 70 caractères maximum. Mots-clés : 5 à 8, en minuscules."
)
```

Des règles **précises et vérifiables** marchent bien mieux que « fais un bon
titre ».

```python
    fiche = demander_structure(
        f"Rédige une fiche produit à partir de ces notes du vendeur :\n\n{produit['notes']}",
        FicheProduit,
        systeme=SYSTEME,
    )
```

Le deuxième argument, `FicheProduit`, est le format imposé. Attention : on donne
la **classe** elle-même, sans parenthèses.

```python
    print("TITRE      :", fiche.titre)
    print("ACCROCHE   :", fiche.accroche)
    print("MOTS-CLÉS  :", ", ".join(fiche.mots_cles))
    print()
    print(fiche.model_dump_json(indent=2))
```

- `fiche.titre` : on lit directement un champ. Pas besoin de chercher le titre
  dans un long texte.
- `", ".join(fiche.mots_cles)` transforme la liste `["vintage", "jean"]` en un
  texte `"vintage, jean"`.
- `print()` sans rien affiche une ligne vide.
- `fiche.model_dump_json(indent=2)` (méthode offerte par Pydantic) convertit
  toute la fiche en JSON, avec 2 espaces d'indentation pour la lisibilité.

**Ce qu'il faut retenir :** la sortie structurée permet de **brancher** l'IA sur
le reste d'un programme : enregistrer dans une base de données, afficher sur un
site, passer à l'étape suivante.

---

## 8. Étape 3 : `e03_chainage.py`

**Objectif :** découper une tâche en plusieurs appels successifs, avec des
contrôles entre eux.

```
notes ──► ① extraire ──► ② contrôler (Python) ──► ③ rédiger ──► ④ post Instagram
```

Le fichier est organisé en **petites fonctions**, une par étape. C'est une
bonne habitude : chaque fonction fait une seule chose, porte un nom clair et
peut être testée seule.

### `extraire_attributs(notes)`

```python
def extraire_attributs(notes: str) -> Attributs:
    return demander_structure(
        "Extrais les faits de ces notes de vendeur. Mets null quand une information "
        f"n'est pas donnée, ne devine pas.\n\n{notes}",
        Attributs,
    )
```

Le premier maillon transforme les notes en faits bien rangés (`Attributs`).
« Mets null » : en JSON, `null` est l'équivalent de `None`. On autorise
explicitement Claude à ne pas savoir.

Remarque : seule la deuxième ligne du texte commence par `f` ; c'est la seule
qui contient une variable. Les deux morceaux sont ensuite collés.

### `controler(attributs)` : la « porte »

```python
def controler(attributs: Attributs) -> list[str]:
    alertes = []
    if attributs.etat == "abîmé":
        alertes.append("Article abîmé : à vérifier avant publication.")
    if attributs.epoque is None:
        alertes.append("Époque inconnue : la fiche ne pourra pas la mettre en avant.")
    return alertes
```

**Il n'y a pas d'IA ici**, et c'est voulu. C'est du Python classique :
- on part d'une liste vide `[]` ;
- on ajoute (`append`) un message pour chaque problème trouvé ;
- on renvoie la liste (vide si tout va bien).

`is None` est la bonne façon de tester si une valeur est `None`.

C'est **ton code** qui décide de la suite, pas le modèle. C'est la différence
fondamentale entre un **workflow** et un **agent**.

### `rediger_fiche(attributs)`

```python
def rediger_fiche(attributs: Attributs) -> FicheProduit:
    return demander_structure(
        f"Rédige la fiche produit à partir de ces faits vérifiés :\n\n{attributs.model_dump_json(indent=2)}",
        FicheProduit,
        systeme=SYSTEME_REDACTEUR,
    )
```

Le rédacteur ne voit **que les faits extraits**, pas les notes brutes, et
`SYSTEME_REDACTEUR` lui interdit d'inventer. On réduit ainsi le risque qu'il
ajoute des informations fausses, une « hallucination ».

### `ecrire_post(fiche)`

Un dernier appel, en texte libre cette fois (`demander`), pour un post
Instagram à partir du titre et de l'accroche.

### `pipeline(notes)` : la chaîne complète, réutilisable

```python
def pipeline(notes: str) -> tuple[Attributs, FicheProduit] | None:
    attributs = extraire_attributs(notes)
    alertes = controler(attributs)
    for alerte in alertes:
        print("  ⚠", alerte)
    if attributs.etat == "abîmé":
        return None  # on arrête la chaîne : un humain doit regarder
    return attributs, rediger_fiche(attributs)
```

- `tuple[Attributs, FicheProduit] | None` : la fonction renvoie **soit** une
  paire (un *tuple*, comme une petite liste figée) contenant les attributs et
  la fiche, **soit** `None`.
- `return None` en plein milieu arrête la fonction immédiatement : la fiche
  n'est jamais rédigée. On ne paie pas un appel inutile.
- `return attributs, rediger_fiche(attributs)` : la virgule crée le tuple.
- Le `#` commence un **commentaire** : Python l'ignore, c'est pour les humains.

Cette fonction n'est pas utilisée par `main()` ici. Elle sert à l'étape 5, qui
l'importe.

### `main()`

Elle enchaîne les étapes en affichant chaque résultat intermédiaire, pour que
tu **voies** la chaîne fonctionner. Une ligne mérite une explication :

```python
    print("\n".join(alertes) or "OK, rien à signaler.")
```

- `"\n".join(alertes)` met chaque alerte sur sa propre ligne.
- Si la liste est vide, on obtient un texte vide `""`. En Python, un texte vide
  compte comme « faux », donc `or` prend la valeur de droite : on affiche
  « OK, rien à signaler. ».

**Ce qu'il faut retenir :** plusieurs appels simples et vérifiables valent mieux
qu'un énorme prompt qui fait tout.

---

## 9. Étape 4 : `e04_routage.py`

**Objectif :** choisir le bon traitement selon le type de produit.

```python
BASE = (
    "Tu es rédacteur pour une boutique en ligne d'articles vintage. "
    ...
)

SPECIALISTES = {
    "vetement": BASE + "Pour un vêtement : précise la taille, la coupe, ...",
    "decoration": BASE + "Pour un objet déco : donne les dimensions, ...",
    "accessoire": BASE + "Pour un accessoire : décris les finitions, ...",
}
```

- `BASE` contient les règles communes à tous les rédacteurs.
- `SPECIALISTES` est un **dictionnaire** : la clé est le nom de la catégorie, la
  valeur est le prompt système complet. Le `+` colle deux textes.

```python
def classer(notes: str) -> Categorie:
    return demander_structure(
        f"Classe ce produit dans une catégorie de la boutique :\n\n{notes}",
        Categorie,
    )
```

Grâce au `Literal` de la classe `Categorie`, la réponse est **forcément** l'une
des trois clés du dictionnaire. Pas de risque de recevoir « Vêtements » avec une
majuscule et un accent, ce qui ferait planter la ligne suivante.

```python
def main():
    for produit in charger_produits():
        categorie = classer(produit["notes"])
        print(f"\n[{produit['id']}] → {categorie.categorie}  ({categorie.justification})")

        fiche = demander_structure(
            ...,
            FicheProduit,
            systeme=SPECIALISTES[categorie.categorie],
        )
```

- `for produit in charger_produits():` répète le bloc pour **chacun** des 4 produits.
- `categorie` est l'objet `Categorie` renvoyé par Claude ; `categorie.categorie`
  est son champ texte (par exemple `"decoration"`).
- `SPECIALISTES[categorie.categorie]` va chercher le bon prompt dans le dictionnaire.

**Ce qu'il faut retenir :** le routage garde chaque prompt court et spécialisé.
Pour améliorer les fiches « déco », tu modifies une seule ligne sans risquer de
dégrader les vêtements.

---

## 10. Étape 5 : `e05_parallelisation.py`

**Objectif :** traiter plusieurs produits **en même temps** pour gagner du temps.

```python
import time
from concurrent.futures import ThreadPoolExecutor

from etapes.e03_chainage import pipeline
from fiches.commun import charger_produits
```

- `time` sert à mesurer la durée.
- `ThreadPoolExecutor` (fourni avec Python) exécute des tâches en parallèle.
- On **réutilise** la fonction `pipeline` de l'étape 3 au lieu de la réécrire.
  C'est ici que le `if __name__ == "__main__":` de l'étape 3 est utile : l'import
  ne relance pas son `main()`.

```python
def traiter(produit: dict) -> str:
    resultat = pipeline(produit["notes"])
    if resultat is None:
        return f"[{produit['id']}] mis de côté pour vérification humaine"
    _, fiche = resultat
    return f"[{produit['id']}] {fiche.titre}"
```

- On gère le cas où `pipeline` renvoie `None` (article abîmé).
- `_, fiche = resultat` : le tuple contient deux éléments, on les « déballe »
  dans deux variables. Le nom `_` est une convention qui signifie « je n'utilise
  pas cette valeur » (ici, les attributs).

```python
    debut = time.perf_counter()
    with ThreadPoolExecutor(max_workers=4) as executeur:
        for ligne in executeur.map(traiter, produits):
            print(ligne)
    duree = time.perf_counter() - debut
```

- `time.perf_counter()` donne l'heure précise. On la note avant et après, puis
  on soustrait pour obtenir la durée.
- `with ... as executeur:` ouvre un « groupe de travailleurs » (4 au maximum)
  et le referme proprement à la fin du bloc.
- `executeur.map(traiter, produits)` lance `traiter(produit)` pour chaque
  produit, **tous en même temps**, et renvoie les résultats **dans l'ordre**
  des produits.

**Pourquoi ça accélère ?** Pendant un appel à Claude, ton ordinateur ne fait
rien : il attend la réponse d'internet. Au lieu d'attendre 4 fois de suite, on
attend 4 fois en même temps.

```python
    print(f"\n{len(produits)} produits traités en {duree:.1f} s en parallèle.")
```

`{duree:.1f}` affiche la durée avec un seul chiffre après la virgule.

**Ce qu'il faut retenir :** quand des tâches ne dépendent pas les unes des
autres, lance-les en parallèle.

---

## 11. Étape 6 : `e06_evaluateur_optimiseur.py`

**Objectif :** améliorer une fiche en boucle grâce à un relecteur.

```
rédiger ──► évaluer ──► validée ? ── oui ──► fin
   ▲                       │
   └──── remarques ◄── non ┘
```

```python
MAX_TOURS = 3
```

Une **limite de sécurité**. Sans elle, si le relecteur n'est jamais satisfait,
la boucle tournerait sans fin, et chaque tour coûte de l'argent.

```python
GRILLE = """Tu relis des fiches produits avant publication. Vérifie chaque point :
1. Aucune information inventée : tout doit venir des notes du vendeur.
...
Valide la fiche seulement si les 5 points sont respectés."""
```

Les triples guillemets `"""` permettent d'écrire un texte sur plusieurs lignes,
retours à la ligne compris. La grille est **concrète** (« 70 caractères
maximum », « entre 60 et 150 mots ») : un relecteur avec des critères flous
donne des avis flous.

```python
    produit = charger_produits()[2]
    notes = produit["notes"]
    consigne = f"Rédige la fiche produit à partir de ces notes :\n\n{notes}"
```

On prend le 3ᵉ produit (indice `2`), le sac à main, et on prépare la première consigne.

```python
    for tour in range(1, MAX_TOURS + 1):
```

`range(1, 4)` donne 1, 2, 3. On écrit `MAX_TOURS + 1` parce que la borne de
fin est exclue.

```python
        fiche = demander_structure(consigne, FicheProduit, systeme=SYSTEME_REDACTEUR)

        critique = demander_structure(
            f"Notes du vendeur :\n{notes}\n\nFiche à relire :\n{fiche.model_dump_json(indent=2)}",
            Critique,
            systeme=GRILLE,
            effort="medium",
        )
```

- Le **rédacteur** écrit la fiche.
- Le **relecteur** est un second appel, avec un autre prompt système (la
  grille). On lui donne les notes d'origine **et** la fiche : sans les notes,
  il ne pourrait pas repérer une information inventée.
- `effort="medium"` : relire demande plus de soin, on laisse Claude réfléchir
  davantage.

```python
        if critique.validee:
            print("\nFiche finale :\n" + fiche.model_dump_json(indent=2))
            return
```

Si la fiche est validée, on l'affiche et `return` termine `main()`, donc la
boucle s'arrête.

```python
        consigne = (
            f"Notes du vendeur :\n{notes}\n\nVoici ta fiche précédente :\n{fiche.model_dump_json(indent=2)}\n\n"
            "Corrige-la en tenant compte de ces remarques du relecteur :\n- " + "\n- ".join(critique.problemes)
        )
```

Sinon, on **remplace** la consigne pour le tour suivant : les notes, la fiche
précédente et la liste des problèmes. `"\n- ".join(...)` présente chaque
problème sur une ligne commençant par un tiret.

```python
    print(f"\nPas validée après {MAX_TOURS} tours : à relire par un humain.")
```

Cette ligne n'est atteinte que si la boucle se termine sans `return`, donc
après 3 échecs.

**Ce qu'il faut retenir :** séparer « celui qui écrit » de « celui qui juge »
améliore la qualité, à condition d'avoir des critères précis et une limite de tours.

---

## 12. Étape 7 : `e07_agent.py`

**Objectif :** laisser Claude décider lui-même des actions à mener.

Jusqu'ici, ton code fixait l'ordre des étapes. Ici, tu donnes à Claude un
**objectif** et des **outils** (des fonctions Python), et il décide seul quoi
appeler, dans quel ordre, jusqu'à avoir terminé.

### Les imports

```python
import json

from anthropic import beta_tool

from fiches.commun import DOSSIER_SORTIE, MODELE, OPTIONS_REPLI, charger_produits, client
```

`beta_tool` est un **décorateur** fourni par le SDK (voir plus bas). On importe
aussi le `client` lui-même, car cette étape l'utilise directement.

### Les données de prix

```python
PRIX_MARCHE = {
    "veste en jean": [45, 60, 75],
    ...
}
```

Des prix d'exemple. Dans un vrai projet, l'outil pourrait les chercher sur un
site de revente.

### Les outils et le décorateur `@beta_tool`

```python
@beta_tool
def lire_produit(produit_id: str) -> str:
    """Renvoie les notes du vendeur et le prix d'achat d'un produit.

    Args:
        produit_id: Identifiant du produit, par exemple P001.
    """
```

Un **décorateur** est la ligne `@...` placée au-dessus d'une fonction. Il lui
ajoute un comportement. Ici, `@beta_tool` transforme une fonction Python
ordinaire en **outil que Claude peut utiliser**. Il lit :

- le **nom** de la fonction, qui devient le nom de l'outil ;
- les **types** des paramètres (`produit_id: str`) ;
- la **docstring** : la première phrase explique à Claude **à quoi sert**
  l'outil, et la section `Args:` explique chaque paramètre.

**La docstring n'est donc plus un simple commentaire : c'est ce que Claude lit
pour décider d'utiliser l'outil.** Une description vague donne un agent qui se
trompe d'outil.

Les outils renvoient toujours du **texte** (`-> str`), car c'est ce que Claude
reçoit. `json.dumps(...)` transforme un dictionnaire ou une liste Python en
texte JSON. `ensure_ascii=False` garde les accents lisibles (sinon « é »
deviendrait `\u00e9`).

### Les quatre outils, un par un

**`lister_produits_sans_fiche()`**

```python
    deja_faits = {chemin.stem for chemin in DOSSIER_SORTIE.glob("*.json")}
    return json.dumps([p["id"] for p in charger_produits() if p["id"] not in deja_faits])
```

- `DOSSIER_SORTIE.glob("*.json")` trouve tous les fichiers `.json` du dossier
  `sortie/`. L'étoile veut dire « n'importe quel nom ».
- `chemin.stem` est le nom du fichier sans l'extension : `P001.json` donne `P001`.
- `{... for ... in ...}` avec des accolades crée un **ensemble** (*set*) : une
  collection sans doublons, très rapide pour tester « est-ce que X est dedans ? ».
- `[p["id"] for p in ... if ...]` est une **compréhension de liste** : une
  façon compacte de construire une liste. Elle se lit : « l'id de chaque
  produit p, si cet id n'est pas déjà fait ».

**`lire_produit(produit_id)`**

```python
    for produit in charger_produits():
        if produit["id"] == produit_id:
            return json.dumps(produit, ensure_ascii=False)
    return f"Erreur : aucun produit avec l'identifiant {produit_id}."
```

On parcourt les produits et on renvoie le bon dès qu'on le trouve. Si la boucle
se termine sans rien trouver, on renvoie un **message d'erreur clair**. Claude
le lira et pourra corriger sa demande. Un outil ne doit jamais faire planter
l'agent pour une erreur prévisible.

**`consulter_prix_marche(type_article)`**

```python
    prix = PRIX_MARCHE.get(type_article.lower())
    if prix is None:
        return f"Pas de données pour « {type_article} ». Types connus : {', '.join(PRIX_MARCHE)}."
    return json.dumps({"min": min(prix), "median": sorted(prix)[len(prix) // 2], "max": max(prix)})
```

- `.lower()` met en minuscules : « Lampe » et « lampe » donnent le même résultat.
- `.get(...)` renvoie `None` si la clé n'existe pas, au lieu de planter.
- En cas d'échec, on indique à Claude les types connus, pour qu'il réessaie
  avec le bon mot.
- `min()` et `max()` donnent le plus petit et le plus grand prix.
- Pour la médiane : `sorted(prix)` trie la liste, `len(prix) // 2` donne
  l'indice du milieu (`//` est la division entière : `3 // 2` vaut `1`).

**`enregistrer_fiche(produit_id, titre, description, prix_vente)`**

```python
    if len(titre) > 70:
        return "Erreur : titre trop long (70 caractères maximum). Raccourcis-le et réessaie."
    DOSSIER_SORTIE.mkdir(exist_ok=True)
    fiche = {"id": produit_id, "titre": titre, "description": description, "prix_vente": prix_vente}
    (DOSSIER_SORTIE / f"{produit_id}.json").write_text(json.dumps(fiche, ensure_ascii=False, indent=2), encoding="utf-8")
    return f"Fiche {produit_id} enregistrée."
```

- L'outil **vérifie** lui-même la règle des 70 caractères. Si elle n'est pas
  respectée, il refuse et explique pourquoi : l'agent se corrige tout seul.
  C'est plus fiable que de simplement le demander dans le prompt.
- `mkdir(exist_ok=True)` crée le dossier `sortie/`, sans erreur s'il existe déjà.
- `write_text(...)` écrit la fiche dans `sortie/P001.json`, par exemple.
- `prix_vente: float` : un nombre à virgule.

### Le prompt système de l'agent

```python
SYSTEME = (
    "Tu gères le catalogue d'une boutique en ligne d'articles vintage. "
    "Pour chaque produit : lis les notes, consulte le prix du marché, puis enregistre une fiche "
    ...
)
```

On décrit l'objectif, la méthode attendue et les règles métier (« le prix de
vente doit au moins doubler le prix d'achat »). On ne lui dit pas **quand**
appeler quel outil : c'est à lui de décider.

### La boucle de l'agent

```python
    runner = client.beta.messages.tool_runner(
        model=MODELE,
        max_tokens=16000,
        system=SYSTEME,
        output_config={"effort": "medium"},
        tools=[lister_produits_sans_fiche, lire_produit, consulter_prix_marche, enregistrer_fiche],
        messages=[{"role": "user", "content": "Prépare et publie les fiches de tous les produits qui n'en ont pas."}],
        **OPTIONS_REPLI,
    )
```

Le **tool runner** (« exécuteur d'outils ») est fourni par le SDK. Il fait la
boucle d'un agent à ta place :

1. il envoie la demande à Claude ;
2. Claude répond « je veux appeler tel outil avec tels paramètres » ;
3. le runner exécute ta fonction Python ;
4. il renvoie le résultat à Claude ;
5. et il recommence, jusqu'à ce que Claude dise qu'il a fini.

`tools=[...]` est la liste des outils autorisés. Claude ne peut rien faire
d'autre.

```python
    for message in runner:
        for bloc in message.content:
            if bloc.type == "tool_use":
                print(f"🔧 {bloc.name}({json.dumps(bloc.input, ensure_ascii=False)})")
            elif bloc.type == "text" and bloc.text.strip():
                print(f"\n💬 {bloc.text}\n")
```

- `for message in runner:` : chaque tour de boucle correspond à une réponse de
  Claude. C'est ce qui lance réellement l'agent.
- On regarde chaque bloc de la réponse :
  - un bloc `tool_use` est une décision d'utiliser un outil. On affiche son nom
    (`bloc.name`) et ses paramètres (`bloc.input`) ;
  - un bloc `text` est un message de Claude. `.strip()` retire les espaces au
    début et à la fin ; un texte vide compte comme « faux », donc on n'affiche
    rien s'il n'y a que des espaces.

Tu verras défiler les 🔧 : c'est le **raisonnement de l'agent en actions**.
Relance le script une seconde fois : comme les fiches existent déjà dans
`sortie/`, l'agent constatera qu'il n'y a plus rien à faire.

**Ce qu'il faut retenir :**
- un agent = un objectif + des outils + une boucle ;
- les docstrings des outils sont des instructions pour Claude ;
- les outils doivent renvoyer des erreurs claires plutôt que planter ;
- les règles importantes doivent être **vérifiées par le code** (comme les 70
  caractères), pas seulement demandées dans le prompt.

---

## 13. Glossaire

| Terme | Explication |
|---|---|
| **API** | Une « porte d'entrée » qui permet à un programme d'utiliser un service, ici Claude, via internet |
| **Clé API** | Ton mot de passe personnel pour l'API. Secret : jamais dans le code ni sur GitHub |
| **SDK** | Une bibliothèque qui simplifie l'utilisation d'une API (ici `anthropic`) |
| **Prompt** | Le texte d'instruction envoyé au modèle |
| **Prompt système** | Les instructions permanentes : le rôle et les règles |
| **Token** | Un morceau de mot. Les limites et le prix se comptent en tokens |
| **Sortie structurée** | Une réponse imposée dans un format précis (des champs), au lieu de texte libre |
| **Workflow** | Une suite d'appels dont l'ordre est fixé par ton code |
| **Agent** | Un modèle qui choisit lui-même ses actions (outils) pour atteindre un objectif |
| **Outil (tool)** | Une fonction que l'agent peut demander à exécuter |
| **Hallucination** | Quand le modèle invente une information fausse avec assurance |
| **Effort** | Le niveau de réflexion demandé à Claude (`low` → `max`) : plus haut = meilleur mais plus lent et plus cher |
| **Docstring** | Le texte entre `"""` sous une fonction, qui la documente |
| **Décorateur** | Une ligne `@nom` au-dessus d'une fonction, qui lui ajoute un comportement |
| **Module / paquet** | Un fichier `.py` / un dossier de fichiers `.py` avec un `__init__.py` |
