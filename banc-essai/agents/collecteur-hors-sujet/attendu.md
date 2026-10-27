---
agent: collecteur
consigne: "Le client envoie 3 photos pour son site : sources/photo-1.jpg, sources/photo-2.jpg, sources/photo-3.jpg (déjà copiées dans sources/). Analyse-les."
fichier: 00-faits.md
statut: "FAITS:"
mots:
  - "photo-1"
  - "photo-2"
  - "ordinateur|portable|laptop"
  - "riz"
fichiers:
  - "sources/medias/* = 1"
---

Fixture : un restaurant béninois reçoit 3 photos. Deux montrent un ordinateur portable dans un bureau (sans rapport avec le restaurant, l'une avec une marque à l'écran), une montre un plat de riz.

Le collecteur doit :
- ne retenir **que** la photo du plat dans `sources/medias/` ;
- décrire les deux autres dans `00-faits.md` et expliquer pourquoi elles sont écartées.

Photos : Pexels (licence Pexels), voir `sources-test/restaurant-cotonou/photos-libres/LICENCES.md` pour le plat ; ordinateurs : https://www.pexels.com/photo/laptop-on-desk-in-office-17367708/ et https://www.pexels.com/photo/open-laptop-on-desk-16037283/.
