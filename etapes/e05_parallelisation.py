"""Étape 5 — Parallélisation.

Quand des tâches ne dépendent pas les unes des autres, on les lance en même
temps. Ici on traite tous les produits en parallèle avec le pipeline de
l'étape 3, puis on compare le temps avec un traitement un par un.
Lance :  python -m etapes.e05_parallelisation
"""

import time
from concurrent.futures import ThreadPoolExecutor

from etapes.e03_chainage import pipeline
from fiches.commun import charger_produits


def traiter(produit: dict) -> str:
    resultat = pipeline(produit["notes"])
    if resultat is None:
        return f"[{produit['id']}] mis de côté pour vérification humaine"
    _, fiche = resultat
    return f"[{produit['id']}] {fiche.titre}"


def main():
    produits = charger_produits()

    debut = time.perf_counter()
    with ThreadPoolExecutor(max_workers=4) as executeur:
        # map garde l'ordre des produits, même si les réponses arrivent dans le désordre.
        for ligne in executeur.map(traiter, produits):
            print(ligne)
    duree = time.perf_counter() - debut

    print(f"\n{len(produits)} produits traités en {duree:.1f} s en parallèle.")
    print("Exercice : remplace le ThreadPoolExecutor par une simple boucle et compare.")


if __name__ == "__main__":
    main()
