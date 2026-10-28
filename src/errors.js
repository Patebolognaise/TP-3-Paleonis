// erreurs metier
// sans http
class AppError extends Error {
  constructor(message, details) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
  }
}

// requete invalide
class ValidationError extends AppError {}

// ressource absente
class NotFoundError extends AppError {}

// conflit
class ConflictError extends AppError {}

// regle metier
class BusinessRuleError extends AppError {}

module.exports = { AppError, ValidationError, NotFoundError, ConflictError, BusinessRuleError };
