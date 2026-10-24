"""Étape 4 — Routage (routing).

Un premier appel, rapide et bon marché, classe le produit. Ton code envoie
ensuite le produit vers un prompt spécialisé. Chaque spécialiste peut être
amélioré séparément sans casser les autres.

    notes ──► classer ──┬──► spécialiste vêtements
                        ├──► spécialiste déco
                        └──► spécialiste accessoires
Lance :  python -m etapes.e04_routage
"""

from fiches.commun import charger_produits, demander_structure
from fiches.modeles import Categorie, FicheProduit

BASE = (
    "Tu es rédacteur pour une boutique en ligne d'articles vintage. "
    "N'invente rien qui ne soit pas dans les notes et mentionne chaque défaut. "
    "Titre : 70 caractères maximum. Mots-clés : 5 à 8, en minuscules. "
)

SPECIALISTES = {
    "vetement": BASE + "Pour un vêtement : précise la taille, la coupe, comment le porter et l'entretenir.",
    "decoration": BASE + "Pour un objet déco : donne les dimensions, l'ambiance qu'il crée, la pièce où le placer.",
    "accessoire": BASE + "Pour un accessoire : décris les finitions, le côté pratique et avec quoi l'associer.",
}


def classer(notes: str) -> Categorie:
    return demander_structure(
        f"Classe ce produit dans une catégorie de la boutique :\n\n{notes}",
        Categorie,
    )


def main():
    for produit in charger_produits():
        categorie = classer(produit["notes"])
        print(f"\n[{produit['id']}] → {categorie.categorie}  ({categorie.justification})")

        fiche = demander_structure(
            f"Rédige la fiche produit à partir de ces notes :\n\n{produit['notes']}",
            FicheProduit,
            systeme=SPECIALISTES[categorie.categorie],
        )
        print("   ", fiche.titre)
        print("   ", fiche.accroche)


if __name__ == "__main__":
    main()
