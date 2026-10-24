"""Étape 6 — Évaluateur-optimiseur.

Un rédacteur écrit, un évaluateur relit avec une grille précise, et on
recommence avec ses remarques tant que la fiche n'est pas validée (avec une
limite de tours pour ne pas boucler à l'infini).

    rédiger ──► évaluer ──► validée ? ── oui ──► fin
       ▲                       │
       └──── remarques ◄── non ┘
Lance :  python -m etapes.e06_evaluateur_optimiseur
"""

from fiches.commun import charger_produits, demander_structure
from fiches.modeles import Critique, FicheProduit

MAX_TOURS = 3

SYSTEME_REDACTEUR = (
    "Tu es rédacteur pour une boutique en ligne d'articles vintage. "
    "Titre : 70 caractères maximum. Mots-clés : 5 à 8, en minuscules."
)

GRILLE = """Tu relis des fiches produits avant publication. Vérifie chaque point :
1. Aucune information inventée : tout doit venir des notes du vendeur.
2. Chaque défaut des notes est mentionné clairement dans la description.
3. Le titre fait 70 caractères maximum et contient le type d'article.
4. Le ton est chaleureux sans superlatifs creux (« incroyable », « unique »…).
5. La description fait entre 60 et 150 mots.
Liste chaque problème précisément. Valide la fiche seulement si les 5 points sont respectés."""


def main():
    produit = charger_produits()[2]
    notes = produit["notes"]
    consigne = f"Rédige la fiche produit à partir de ces notes :\n\n{notes}"

    for tour in range(1, MAX_TOURS + 1):
        fiche = demander_structure(consigne, FicheProduit, systeme=SYSTEME_REDACTEUR)
        print(f"\n— Tour {tour} — {fiche.titre}")

        # L'évaluateur reçoit les notes d'origine pour pouvoir détecter les inventions.
        critique = demander_structure(
            f"Notes du vendeur :\n{notes}\n\nFiche à relire :\n{fiche.model_dump_json(indent=2)}",
            Critique,
            systeme=GRILLE,
            effort="medium",
        )
        print(f"  note {critique.note_sur_10}/10, validée : {critique.validee}")
        for probleme in critique.problemes:
            print("  -", probleme)

        if critique.validee:
            print("\nFiche finale :\n" + fiche.model_dump_json(indent=2))
            return

        consigne = (
            f"Notes du vendeur :\n{notes}\n\nVoici ta fiche précédente :\n{fiche.model_dump_json(indent=2)}\n\n"
            "Corrige-la en tenant compte de ces remarques du relecteur :\n- " + "\n- ".join(critique.problemes)
        )

    print(f"\nPas validée après {MAX_TOURS} tours : à relire par un humain.")


if __name__ == "__main__":
    main()
