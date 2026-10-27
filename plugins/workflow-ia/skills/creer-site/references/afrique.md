# Pack Afrique : pratiques locales (Afrique de l'Ouest et centrale francophone)

Référence partagée par les agents quand le brief situe l'activité en Afrique francophone (Bénin, Togo, Côte d'Ivoire, Sénégal, Burkina Faso, Mali, Niger, Cameroun, Gabon, Congo…). Elle complète les conventions, sans les remplacer.

Les tarifs, les opérateurs couverts et les textes de loi changent : avant de recommander un prestataire ou de citer une loi, vérifie sa documentation officielle (WebFetch). Si tu ne peux pas vérifier, écris-le comme réserve.

## 1. Contact : WhatsApp et téléphone d'abord

Les clients écrivent sur WhatsApp et appellent plus qu'ils ne remplissent des formulaires.

- **Lien WhatsApp** : `https://wa.me/<numéro>?text=<message encodé>`.
  - Le numéro est au format international, en chiffres seulement : sans `+`, sans `00`, sans espaces. Par exemple `22901XXXXXXXX` pour le Bénin.
  - Le message est encodé une seule fois avec `encodeURIComponent`.
  - Un lien sans numéro (`wa.me/?text=`) n'ouvre pas la conversation du commerce : il est interdit.
- **Message prérempli** : court, il dit d'où vient le client et ce qu'il veut. Par exemple « Bonjour, je viens du site. Je voudrais réserver une table pour 4 personnes samedi à 20 h. »
  - Un formulaire de réservation ou de commande peut **composer** ce message côté navigateur, puis ouvrir WhatsApp. Rien n'est envoyé à un serveur, aucune donnée n'est stockée, et il n'y a donc ni base de données ni Dev back.
- **Téléphone** : un lien `tel:+229…` avec le `+`. Le numéro est affiché par groupes lisibles (`+229 01 97 00 00 00`).
- **Bouton d'action fixe sur mobile** : « WhatsApp » et « Appeler », toujours visibles en bas de l'écran.
  - Il ne doit pas masquer de contenu : prévois une marge en bas de la page.
  - Les zones de clic font au moins 44 px.
- **Numérotation** : plusieurs pays ont changé de format récemment. Le Bénin est passé à 10 chiffres commençant par `01` fin 2024, la Côte d'Ivoire à 10 chiffres en 2021.
  - Un numéro à l'ancien format dans les sources est marqué « à confirmer ».
  - Tu ne le convertis jamais toi-même.

## 2. Paiement : du plus simple au plus intégré

Choisis le niveau **le plus simple qui suffit** au brief. Le niveau est noté dans `02-architecture.md`.

| Niveau | Comment | Code serveur | Quand |
|---|---|---|---|
| 0. Pas de paiement en ligne | Paiement sur place, à la livraison, ou par Mobile Money sur le numéro marchand **après** confirmation par WhatsApp. Le site explique la marche à suivre. | non | Par défaut pour un MVP vitrine, une réservation, la plupart des commerces |
| 1. Lien de paiement | Lien créé par le client dans son tableau de bord du prestataire (FedaPay, KkiaPay Direct…), placé sur un bouton. Le prestataire confirme le paiement au commerçant. | non | Montants fixes : acompte, inscription, billet, don |
| 2. Paiement intégré | Widget du prestataire dans la page (clé **publique** seulement), puis **vérification obligatoire côté serveur** avec la clé secrète avant de confirmer la commande | oui (Netlify Function, Dev back) | Panier, montants variables, confirmation automatique |

Prestataires courants (à vérifier selon le pays et l'activité) :
- **FedaPay** (Bénin et plusieurs pays de la zone UEMOA) : Checkout.js, liens de paiement. Documentation : docs.fedapay.com.
- **KkiaPay** (Bénin, Côte d'Ivoire…) : widget JS, KkiaPay Direct pour les liens. Documentation : docs.kkiapay.me.
- **CinetPay** (Côte d'Ivoire, Sénégal, Cameroun…) : SDK Seamless. La notification n'est jamais une preuve : il faut toujours appeler l'API de vérification. Documentation : docs.cinetpay.com.
- **Wave, Orange Money, MTN MoMo, Moov Money** : souvent via ces agrégateurs. Leurs API directes demandent un contrat marchand.

Règles de sécurité du paiement :
- **Aucune clé secrète dans le code du navigateur**, ni dans le dépôt. Elles vont dans les variables d'environnement Netlify.
- **Ne jamais confirmer une commande sur la seule foi du navigateur** : le résultat d'un widget côté navigateur peut être falsifié. Il faut une vérification côté serveur auprès du prestataire, avec la transaction, le montant et la devise.
- La notification (webhook) du prestataire peut arriver plusieurs fois : son traitement doit être idempotent.
  - Si le prestataire signe ses notifications, vérifie la signature.
  - Sinon, rappelle son API de vérification.
- **Mode test d'abord** : clés sandbox pendant le développement, clés live seulement à la mise en production, posées par le client lui-même.
- **CSP** : n'autorise que les domaines du prestataire choisi (script, frame, connect), rien de plus large.

## 3. Prix et monnaie

- Le franc CFA s'écrit `3 500 FCFA` (ou `F CFA`), avec une espace insécable fine entre les milliers et une espace insécable avant l'unité.
  - Utilise `Intl.NumberFormat('fr-FR')` puis ajoute « FCFA ».
  - N'utilise pas le symbole `XOF` à l'écran : le code ISO `XOF` (UEMOA) ou `XAF` (CEMAC) sert seulement dans les données (JSON-LD, paiement).
- Un prix absent des sources reste `[À COMPLÉTER]`, jamais estimé.

## 4. Référencement local

- **Adresse telle qu'on la donne sur place** : quartier, repère (« à côté de la pharmacie… »), ville.
  - Beaucoup de rues n'ont pas de numéro : n'en invente pas.
  - Mets le repère dans le texte visible ET dans le JSON-LD (`address.streetAddress` ou `description`).
- **Données structurées** : `LocalBusiness`, ou son sous-type exact (`Restaurant`, `HairSalon`, `Store`, `LegalService`…).
  - Champs : `name`, `address` (`addressLocality`, `addressCountry` en code ISO : `BJ`, `CI`, `SN`…), `telephone` au format international, `openingHoursSpecification`, `priceRange` en FCFA, `geo` seulement si des coordonnées sont fournies, `sameAs` pour les réseaux.
- **Fiche Google Business Profile** : c'est souvent elle qui apporte le plus de visites. Dans le bilan final, conseille au client de la créer ou de la mettre à jour, avec le même nom, la même adresse et le même téléphone que le site.
- **Mots des clients** : les noms locaux des plats et des services (« amiwo », « tresses », « pagne »), la ville et le quartier dans les titres et les descriptions.
- **Langue** : `lang="fr"`. Une autre langue (fon, wolof, anglais pour le Nigeria ou le Ghana voisins) n'est ajoutée que si le brief la demande.

## 5. Connexions lentes et téléphones d'entrée de gamme

- Budget par page : moins de 500 Ko au premier chargement, photos en WebP, aucune vidéo en lecture automatique, pas de carte interactive chargée d'office. Remplace la carte par un lien « Voir sur la carte » ou une image statique.
- Polices hébergées sur le site (pas de Google Fonts distant), 2 graisses au maximum.
- Le site doit rester utilisable sans JavaScript : les liens WhatsApp et `tel:` sont de simples liens.

## 6. Textes légaux (gabarits à faire relire)

Les mentions légales et la politique de confidentialité sont des **gabarits** à faire relire par le client ou un juriste. Elles indiquent le texte et l'autorité du pays, **sans citer d'article** qui n'a pas été vérifié dans le texte officiel.

| Pays | Texte de référence (données personnelles) | Autorité |
|---|---|---|
| Bénin | Loi n° 2017-20 portant Code du numérique (Livre V), modifiée par la loi n° 2020-35 | APDP |
| Côte d'Ivoire | Loi n° 2013-450 relative à la protection des données à caractère personnel | ARTCI |
| Sénégal | Loi n° 2008-12 sur la protection des données à caractère personnel | CDP |
| Togo | Loi n° 2019-014 relative à la protection des données à caractère personnel | IPDCP |
| Burkina Faso | Loi n° 001-2021/AN portant protection des personnes à l'égard du traitement des données à caractère personnel | CIL |
| Autres | à vérifier | à vérifier |

Les textes évoluent : vérifie sur le site officiel de l'autorité ou du gouvernement avant de les citer, sinon marque la ligne « à vérifier ».

Contenu minimal des **mentions légales** :
- éditeur : nom ou raison sociale, forme juridique, numéro RCCM et IFU ou NINEA selon le pays, adresse, téléphone, e-mail ;
- responsable de la publication ;
- hébergeur : Netlify, Inc., avec son adresse publiée sur son site.

Contenu minimal de la **politique de confidentialité** :
- les données collectées : souvent aucune si le formulaire ouvre seulement WhatsApp, et dans ce cas, dis-le ;
- la finalité, la durée de conservation et les destinataires ;
- les transferts hors du pays (Netlify, WhatsApp/Meta, prestataire de paiement) ;
- les droits de la personne et l'adresse pour les exercer ;
- l'autorité de contrôle du pays.

Cookies : sans outil de mesure d'audience ni publicité, pas de bandeau cookies. Si le client en ajoute un, prévois le consentement.
