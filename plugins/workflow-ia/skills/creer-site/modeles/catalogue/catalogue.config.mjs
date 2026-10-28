// Adresse du Google Sheet du client, publié au format CSV (Fichier → Partager → Publier sur le web → CSV).
// Elle est publique : ce n'est pas un secret. La variable d'environnement CATALOGUE_CSV_URL la remplace si elle existe.
export const CATALOGUE_CSV_URL = process.env.CATALOGUE_CSV_URL || "";
