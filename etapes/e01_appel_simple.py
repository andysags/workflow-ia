"""Étape 1 — Un seul appel à Claude.

C'est la brique de base de tout workflow : un prompt entre, un texte sort.
Lance :  python -m etapes.e01_appel_simple
"""

from fiches.commun import charger_produits, demander

SYSTEME = (
    "Tu es rédacteur pour une boutique en ligne d'articles vintage. "
    "Ton style est chaleureux, précis et honnête : tu signales toujours les défauts."
)


def main():
    produit = charger_produits()[0]

    fiche = demander(
        f"Rédige une fiche produit à partir de ces notes du vendeur :\n\n{produit['notes']}",
        systeme=SYSTEME,
    )

    print(fiche)


if __name__ == "__main__":
    main()
