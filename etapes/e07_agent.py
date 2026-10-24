"""Étape 7 — Un agent avec des outils.

Jusqu'ici, c'est ton code qui décidait de l'ordre des étapes (workflow).
Un agent, lui, reçoit un objectif et des outils, puis décide SEUL quels
outils appeler et dans quel ordre, en boucle, jusqu'à avoir fini.

Plus souple, mais moins prévisible et plus coûteux : n'utilise un agent que
quand le chemin ne peut pas être écrit à l'avance.
Lance :  python -m etapes.e07_agent
"""

import json

from anthropic import beta_tool

from fiches.commun import DOSSIER_SORTIE, MODELE, OPTIONS_REPLI, charger_produits, client

# Prix observés sur des plateformes de revente (données d'exemple).
PRIX_MARCHE = {
    "veste en jean": [45, 60, 75],
    "lampe": [40, 55, 90],
    "sac à main": [50, 70, 120],
    "chemise": [20, 28, 35],
}


@beta_tool
def lister_produits_sans_fiche() -> str:
    """Liste les identifiants des produits qui n'ont pas encore de fiche publiée."""
    deja_faits = {chemin.stem for chemin in DOSSIER_SORTIE.glob("*.json")}
    return json.dumps([p["id"] for p in charger_produits() if p["id"] not in deja_faits])


@beta_tool
def lire_produit(produit_id: str) -> str:
    """Renvoie les notes du vendeur et le prix d'achat d'un produit.

    Args:
        produit_id: Identifiant du produit, par exemple P001.
    """
    for produit in charger_produits():
        if produit["id"] == produit_id:
            return json.dumps(produit, ensure_ascii=False)
    return f"Erreur : aucun produit avec l'identifiant {produit_id}."


@beta_tool
def consulter_prix_marche(type_article: str) -> str:
    """Donne des prix de revente constatés pour un type d'article vintage.

    Args:
        type_article: Un de : veste en jean, lampe, sac à main, chemise.
    """
    prix = PRIX_MARCHE.get(type_article.lower())
    if prix is None:
        return f"Pas de données pour « {type_article} ». Types connus : {', '.join(PRIX_MARCHE)}."
    return json.dumps({"min": min(prix), "median": sorted(prix)[len(prix) // 2], "max": max(prix)})


@beta_tool
def enregistrer_fiche(produit_id: str, titre: str, description: str, prix_vente: float) -> str:
    """Publie la fiche finale d'un produit dans la boutique.

    Args:
        produit_id: Identifiant du produit.
        titre: Titre de la fiche, 70 caractères maximum.
        description: Description complète, défauts compris.
        prix_vente: Prix de vente proposé en euros.
    """
    if len(titre) > 70:
        return "Erreur : titre trop long (70 caractères maximum). Raccourcis-le et réessaie."
    DOSSIER_SORTIE.mkdir(exist_ok=True)
    fiche = {"id": produit_id, "titre": titre, "description": description, "prix_vente": prix_vente}
    (DOSSIER_SORTIE / f"{produit_id}.json").write_text(json.dumps(fiche, ensure_ascii=False, indent=2), encoding="utf-8")
    return f"Fiche {produit_id} enregistrée."


SYSTEME = (
    "Tu gères le catalogue d'une boutique en ligne d'articles vintage. "
    "Pour chaque produit : lis les notes, consulte le prix du marché, puis enregistre une fiche "
    "honnête (défauts mentionnés, rien d'inventé). Le prix de vente doit au moins doubler le prix "
    "d'achat tout en restant dans la fourchette du marché. Termine par un récapitulatif court."
)


def main():
    runner = client.beta.messages.tool_runner(
        model=MODELE,
        max_tokens=16000,
        system=SYSTEME,
        output_config={"effort": "medium"},
        tools=[lister_produits_sans_fiche, lire_produit, consulter_prix_marche, enregistrer_fiche],
        messages=[{"role": "user", "content": "Prépare et publie les fiches de tous les produits qui n'en ont pas."}],
        **OPTIONS_REPLI,
    )

    # Le runner fait la boucle à ta place : appel à Claude → exécution des outils → nouvel appel…
    # Chaque tour de boucle te donne la réponse de Claude, pour observer ce qu'il décide.
    for message in runner:
        for bloc in message.content:
            if bloc.type == "tool_use":
                print(f"🔧 {bloc.name}({json.dumps(bloc.input, ensure_ascii=False)})")
            elif bloc.type == "text" and bloc.text.strip():
                print(f"\n💬 {bloc.text}\n")

    print(f"Fiches enregistrées dans {DOSSIER_SORTIE}/")


if __name__ == "__main__":
    main()
