const {
  ValidationError,
  NotFoundError,
  ConflictError,
  BusinessRuleError,
} = require("../errors");

// Erreurs métier de l'application -> code HTTP
const APP_ERRORS = new Map([
  [ValidationError, 400],
  [NotFoundError, 404],
  [ConflictError, 409],
  [BusinessRuleError, 422],
]);

// Messages lisibles pour chaque contrainte nommée de database/schema.sql.
// On s'appuie sur le nom de la contrainte, pas sur le texte de l'erreur (traduit selon la langue du serveur).
const CONSTRAINT_MESSAGES = {
  datacenter_nom_unique: "Ce nom de datacenter existe déjà",
  client_email_unique: "Cet email est déjà utilisé par un autre client",
  client_siret_unique: "Ce SIRET est déjà utilisé par un autre client",
  client_type_check: "type doit valoir particulier ou entreprise",
  client_nom_non_vide: "nom ne doit pas être vide",
  client_email_format: "email n'a pas un format valide",
  client_telephone_format: "telephone n'a pas un format valide",
  client_siret_format: "siret doit contenir exactement 14 chiffres",
  client_siret_entreprise: "Un SIRET est obligatoire pour une entreprise et interdit pour un particulier",
  client_abonnement_en_cours: "Suppression impossible : le client a encore un abonnement actif ou suspendu (RG8)",
  offre_nom_unique: "Une offre porte déjà ce nom",
  offre_nom_non_vide: "nom ne doit pas être vide",
  offre_categorie_check: "categorie doit valoir vps, mutualise, dedie ou domaine",
  offre_prix_positif: "prix_mensuel_ht ne peut pas être négatif",
  serveur_nom_hote_unique: "Ce nom d'hôte est déjà utilisé",
  serveur_adresse_ip_unique: "Cette adresse IP est déjà utilisée",
  serveur_statut_check: "statut doit valoir en_service, maintenance ou hors_service",
  technicien_email_unique: "Cet email est déjà utilisé par un autre technicien",
  technicien_email_pro: "L'email d'un technicien doit se terminer par @paleonis.fr",
  abonnement_statut_check: "statut doit valoir actif, suspendu ou resilie",
  abonnement_prix_positif: "prix_applique ne peut pas être négatif",
  abonnement_dates_coherentes: "date_fin ne peut pas précéder date_debut",
  abonnement_resilie_date_fin: "Un abonnement résilié doit avoir une date de fin",
  abonnement_serveur_en_cours_unique: "Ce serveur est déjà attribué à un abonnement en cours",
  ticket_sujet_non_vide: "sujet ne doit pas être vide",
  ticket_description_non_vide: "description ne doit pas être vide",
  ticket_priorite_check: "priorite doit valoir basse, normale, haute ou critique",
  ticket_statut_check: "statut doit valoir ouvert, en_cours, resolu ou ferme",
};

// Traduit une erreur PostgreSQL (err.code = SQLSTATE) en { status, message }, ou null si inconnue
function fromPostgres(err, req) {
  const known = CONSTRAINT_MESSAGES[err.constraint];
  switch (err.code) {
    case "23505": // unique_violation
      return { status: 409, message: known ?? "Cette valeur existe déjà" };
    case "23503": // foreign_key_violation
      // DELETE bloqué par une ligne qui référence encore la ressource -> 409,
      // sinon INSERT/UPDATE qui pointe vers une ressource inexistante -> 404
      if (req.method === "DELETE") {
        return { status: 409, message: "Suppression impossible : la ressource est encore utilisée" };
      }
      return {
        status: 404,
        message: `Référence inexistante : ${err.constraint?.replace(/^[a-z]+_(.+)_fkey$/, "$1") ?? "clé étrangère"}`,
      };
    case "23001": // restrict_violation (trigger RG8)
      return { status: 409, message: known ?? "Suppression impossible" };
    case "23514": // check_violation
      return { status: 422, message: known ?? "Une règle métier n'est pas respectée" };
    case "23502": // not_null_violation
      return { status: 400, message: `${err.column} est obligatoire` };
    case "22001": // string_data_right_truncation
      return { status: 422, message: "Une valeur dépasse la longueur maximale autorisée" };
    case "22P02": // invalid_text_representation (texte au lieu d'un entier, IP invalide...)
    case "22003": // numeric_value_out_of_range
    case "22007": // invalid_datetime_format
    case "22008": // datetime_field_overflow
      return { status: 400, message: "Format de donnée invalide" };
    default:
      return null;
  }
}

// Aucune route n'a répondu
function notFound(req, res) {
  res.status(404).json({ error: `Route inconnue : ${req.method} ${req.originalUrl}` });
}

// Middleware global : un seul format d'erreur dans toute l'API -> { error, details? }
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // JSON mal formé envoyé par le client
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "JSON invalide" });
  }

  for (const [ErrorClass, status] of APP_ERRORS) {
    if (err instanceof ErrorClass) {
      const body = { error: err.message };
      if (err.details) body.details = err.details;
      return res.status(status).json(body);
    }
  }

  const pgError = fromPostgres(err, req);
  if (pgError) {
    return res.status(pgError.status).json({ error: pgError.message });
  }

  console.error(err);
  res.status(500).json({ error: "Erreur interne du serveur" });
}

module.exports = { notFound, errorHandler };
