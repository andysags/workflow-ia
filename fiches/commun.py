"""Outils partagés par toutes les étapes du tutoriel.

Chaque étape importe ce module pour ne pas répéter la configuration du client.
"""

import json
from pathlib import Path

import anthropic

MODELE = "claude-opus-5-5"

RACINE = Path(__file__).resolve().parent.parent
DOSSIER_SORTIE = RACINE / "sortie"

# Repli côté serveur : si le modèle décline une requête (classifieurs de sécurité),
# l'API la relance automatiquement sur un autre modèle adapté, dans le même appel.
OPTIONS_REPLI = {"betas": ["server-side-fallback-2026-07-01"], "fallbacks": "default"}

# Le client lit la clé dans la variable d'environnement ANTHROPIC_API_KEY.
client = anthropic.Anthropic()


def charger_produits() -> list[dict]:
    """Renvoie la liste des produits bruts (notes prises par le vendeur)."""
    chemin = RACINE / "donnees" / "produits.json"
    return json.loads(chemin.read_text(encoding="utf-8"))


def verifier(reponse) -> None:
    """Arrête le programme proprement si la réponse est inutilisable."""
    if reponse.stop_reason == "refusal":
        raise RuntimeError(f"Claude a refusé la requête : {reponse.stop_details}")
    if reponse.stop_reason == "max_tokens":
        raise RuntimeError("Réponse coupée : augmente max_tokens.")


def demander(prompt: str, *, systeme: str | None = None, effort: str = "low") -> str:
    """Un appel à Claude qui renvoie simplement le texte de la réponse.

    `effort` (low | medium | high | xhigh | max) règle combien Claude réfléchit :
    plus c'est haut, meilleure est la qualité sur les tâches difficiles, mais
    plus c'est lent et cher.
    """
    reponse = client.beta.messages.create(
        model=MODELE,
        max_tokens=16000,
        system=systeme if systeme else anthropic.omit,
        output_config={"effort": effort},
        messages=[{"role": "user", "content": prompt}],
        **OPTIONS_REPLI,
    )
    verifier(reponse)
    return "".join(bloc.text for bloc in reponse.content if bloc.type == "text")


def demander_structure(prompt: str, format_sortie, *, systeme: str | None = None, effort: str = "low"):
    """Un appel à Claude qui renvoie un objet Pydantic validé (et non du texte libre)."""
    reponse = client.beta.messages.parse(
        model=MODELE,
        max_tokens=16000,
        system=systeme if systeme else anthropic.omit,
        output_config={"effort": effort},
        output_format=format_sortie,
        messages=[{"role": "user", "content": prompt}],
        **OPTIONS_REPLI,
    )
    verifier(reponse)
    return reponse.parsed_output
