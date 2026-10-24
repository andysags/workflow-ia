"""Étape 3 — Chaînage de prompts (prompt chaining).

On découpe la tâche en petites étapes, chacune plus simple et vérifiable :

    notes brutes ──► 1. extraire les faits ──► [contrôle en Python] ──► 2. rédiger la fiche ──► 3. post réseaux sociaux

Le contrôle entre deux étapes (« gate ») est du code normal : c'est TOI qui
décides du chemin, pas le modèle. C'est ce qui distingue un workflow d'un agent.
Lance :  python -m etapes.e03_chainage
"""

from fiches.commun import charger_produits, demander, demander_structure
from fiches.modeles import Attributs, FicheProduit

SYSTEME_REDACTEUR = (
    "Tu es rédacteur pour une boutique en ligne d'articles vintage. "
    "Tu n'utilises QUE les faits fournis : n'invente ni marque, ni date, ni matière. "
    "Tu mentionnes chaque défaut honnêtement dans la description. "
    "Titre : 70 caractères maximum. Mots-clés : 5 à 8, en minuscules."
)


def extraire_attributs(notes: str) -> Attributs:
    return demander_structure(
        "Extrais les faits de ces notes de vendeur. Mets null quand une information "
        f"n'est pas donnée, ne devine pas.\n\n{notes}",
        Attributs,
    )


def controler(attributs: Attributs) -> list[str]:
    """La « porte » entre deux étapes : de simples règles métier en Python."""
    alertes = []
    if attributs.etat == "abîmé":
        alertes.append("Article abîmé : à vérifier avant publication.")
    if attributs.epoque is None:
        alertes.append("Époque inconnue : la fiche ne pourra pas la mettre en avant.")
    return alertes


def rediger_fiche(attributs: Attributs) -> FicheProduit:
    return demander_structure(
        f"Rédige la fiche produit à partir de ces faits vérifiés :\n\n{attributs.model_dump_json(indent=2)}",
        FicheProduit,
        systeme=SYSTEME_REDACTEUR,
    )


def ecrire_post(fiche: FicheProduit) -> str:
    return demander(
        "Écris un post Instagram court (3 phrases max + 5 hashtags) pour ce produit :\n\n"
        f"{fiche.titre}\n{fiche.accroche}"
    )


def pipeline(notes: str) -> tuple[Attributs, FicheProduit] | None:
    """Les étapes 1 et 2, réutilisées par les étapes suivantes du tutoriel."""
    attributs = extraire_attributs(notes)
    alertes = controler(attributs)
    for alerte in alertes:
        print("  ⚠", alerte)
    if attributs.etat == "abîmé":
        return None  # on arrête la chaîne : un humain doit regarder
    return attributs, rediger_fiche(attributs)


def main():
    produit = charger_produits()[0]

    print("① Extraction des faits…")
    attributs = extraire_attributs(produit["notes"])
    print(attributs.model_dump_json(indent=2))

    print("\n② Contrôle…")
    alertes = controler(attributs)
    print("\n".join(alertes) or "OK, rien à signaler.")
    if attributs.etat == "abîmé":
        return

    print("\n③ Rédaction de la fiche…")
    fiche = rediger_fiche(attributs)
    print(fiche.model_dump_json(indent=2))

    print("\n④ Post Instagram…")
    print(ecrire_post(fiche))


if __name__ == "__main__":
    main()
