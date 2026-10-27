---
agent: qa
consigne: "Itération 1. Teste le site du dossier projet (site/ : npm run build, puis npm run preview -- --port <port>)."
fichier: 07-rapport-qa.md
statut: "QA: A_CORRIGER"
mots:
  - "wa\\.me/\\+229|espace|chiffres"
  - "tel:0197000000|tel:0|format international"
  - "wa\\.me/\\?text|sans numéro"
  - "22901970000|11 chiffres|numéro incomplet|incomplet|tronqué"
---

Fixture : une page statique (sans dépendance npm) avec 4 liens de contact faux et 1 juste.
1. `https://wa.me/+229 01 97 00 00 00?text=...` : `+` et espaces dans le numéro, texte non encodé.
2. `tel:0197000000` : pas de format international.
3. `https://wa.me/?text=...` : sans numéro, ce lien n'ouvre pas la conversation du maquis.
4. `https://wa.me/22901970000` (barre fixe) : numéro tronqué, 11 chiffres au lieu de 13 (`22901970000 00`).
5. `tel:+2290197000000` : juste.

La QA doit répondre `QA: A_CORRIGER` et signaler les liens 1 à 4.
