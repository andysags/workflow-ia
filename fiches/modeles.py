"""Les formats de données qu'on demande à Claude de remplir.

Avec les sorties structurées, Claude est obligé de répondre avec exactement
ces champs : ton code peut ensuite les utiliser sans parser du texte libre.
"""

from typing import Literal

from pydantic import BaseModel


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


class FicheProduit(BaseModel):
    """La fiche prête à publier sur la boutique."""

    titre: str
    accroche: str
    description: str
    points_forts: list[str]
    mots_cles: list[str]


class Categorie(BaseModel):
    """Résultat du routage : vers quel spécialiste envoyer le produit."""

    categorie: Literal["vetement", "decoration", "accessoire"]
    justification: str


class Critique(BaseModel):
    """Le verdict de l'évaluateur sur une fiche."""

    note_sur_10: int
    problemes: list[str]
    validee: bool
