---
agent: securite
consigne: Audit de sécurité du dossier projet, itération 1.
fichier: 08-rapport-securite.md
statut: "SECURITE: BLOQUE"
mots:
  - "KKIAPAY_SECRET|clé secrète|sk_test"
  - "côté serveur|server"
  - "montant"
  - "unsafe-eval|default-src \\*|CSP"
  - "innerHTML"
---

La fixture contient volontairement des failles de paiement. L'agent Sécurité doit bloquer et citer :
1. la clé secrète dans le code du navigateur (`KKIAPAY_SECRET`) ;
2. l'inscription confirmée sur la seule foi du navigateur, sans vérification côté serveur ;
3. le montant pris dans l'URL (`?montant=`), donc modifiable par le client ;
4. la CSP trop permissive (`default-src *`, `unsafe-eval`) ;
5. `innerHTML` avec une donnée externe (`r.name`).
