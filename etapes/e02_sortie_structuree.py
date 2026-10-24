"""Étape 2 — Sortie structurée.

Un texte libre est difficile à exploiter dans du code. Ici, Claude remplit
un modèle Pydantic (`FicheProduit`) : on récupère des champs fiables qu'on
peut enregistrer, afficher ou passer à l'étape suivante d'un workflow.
Lance :  python -m etapes.e02_sortie_structuree
"""

from fiches.commun import charger_produits, demander_structure
from fiches.modeles import FicheProduit

SYSTEME = (
    "Tu es rédacteur pour une boutique en ligne d'articles vintage. "
    "Ton style est chaleureux, précis et honnête : tu signales toujours les défauts. "
    "Titre : 70 caractères maximum. Mots-clés : 5 à 8, en minuscules."
)


def main():
    produit = charger_produits()[0]

    fiche = demander_structure(
        f"Rédige une fiche produit à partir de ces notes du vendeur :\n\n{produit['notes']}",
        FicheProduit,
        systeme=SYSTEME,
    )

    # `fiche` est un vrai objet Python : on accède directement aux champs.
    print("TITRE      :", fiche.titre)
    print("ACCROCHE   :", fiche.accroche)
    print("MOTS-CLÉS  :", ", ".join(fiche.mots_cles))
    print()
    print(fiche.model_dump_json(indent=2))


if __name__ == "__main__":
    main()
