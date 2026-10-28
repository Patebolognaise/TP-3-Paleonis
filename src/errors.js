// Erreurs métier levées par les modèles et les contrôleurs.
// Elles ne connaissent pas le HTTP : c'est le middleware d'erreurs global qui les traduit en codes.
class AppError extends Error {
  constructor(message, details) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
  }
}

// Requête mal formée : champ manquant, mauvais type, id non entier
class ValidationError extends AppError {}

// Ressource introuvable
class NotFoundError extends AppError {}

// Conflit avec l'état des données : offre retirée, aucun serveur libre, déjà résilié...
class ConflictError extends AppError {}

// Données bien formées mais contraires à une règle métier
class BusinessRuleError extends AppError {}

module.exports = { AppError, ValidationError, NotFoundError, ConflictError, BusinessRuleError };
