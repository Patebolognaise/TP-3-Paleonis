const { ValidationError } = require("../errors");

// Plus grand entier accepté par une colonne INT PostgreSQL
const INT_MAX = 2147483647;

function isId(value) {
  return Number.isInteger(value) && value > 0 && value <= INT_MAX;
}

// Identifiant reçu dans l'URL : "12" -> 12, "abc" / "-1" / "1.5" -> 400
function parseId(value, field = "id") {
  const id = /^\d+$/.test(value) ? Number(value) : NaN;
  if (!isId(id)) throw new ValidationError(`${field} doit être un entier strictement positif`);
  return id;
}

// Règles de forme d'un champ. Un "?" final rend le champ facultatif (absent ou null -> null).
// La base vérifie ensuite les valeurs métier (valeurs autorisées, prix >= 0, unicité...).
const CHECKS = {
  string: (v) => typeof v === "string" && v.trim() !== "",
  number: (v) => typeof v === "number" && Number.isFinite(v),
  boolean: (v) => typeof v === "boolean",
  id: isId,
};

const MESSAGES = {
  string: "doit être une chaîne non vide",
  number: "doit être un nombre",
  boolean: "doit être un booléen",
  id: "doit être un entier strictement positif",
};

// Vérifie la forme d'un body JSON et renvoie uniquement les champs attendus (chaînes nettoyées)
function checkBody(body, rules) {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    throw new ValidationError("Le corps de la requête doit être un objet JSON");
  }
  const data = {};
  const details = [];
  for (const [field, rule] of Object.entries(rules)) {
    const optional = rule.endsWith("?");
    const type = optional ? rule.slice(0, -1) : rule;
    const value = body[field];
    const empty = value === undefined || value === null || (type === "string" && value === "");

    if (empty) {
      if (optional) data[field] = null;
      else details.push(`${field} est obligatoire`);
    } else if (!CHECKS[type](value)) {
      details.push(`${field} ${MESSAGES[type]}`);
    } else {
      data[field] = type === "string" ? value.trim() : value;
    }
  }
  if (details.length > 0) throw new ValidationError("Données invalides", details);
  return data;
}

// Vérifie les paramètres de query string (?nom=...&en_vente=true). Tous sont facultatifs.
function checkQuery(query, rules) {
  const data = {};
  const details = [];
  for (const [field, type] of Object.entries(rules)) {
    const value = query[field];
    if (value === undefined || value === "") continue;
    if (typeof value !== "string") {
      details.push(`${field} ne doit apparaître qu'une fois`);
    } else if (type === "boolean") {
      if (value === "true" || value === "false") data[field] = value === "true";
      else details.push(`${field} doit valoir true ou false`);
    } else if (type === "id") {
      const id = /^\d+$/.test(value) ? Number(value) : NaN;
      if (isId(id)) data[field] = id;
      else details.push(`${field} doit être un entier strictement positif`);
    } else {
      data[field] = value.trim();
    }
  }
  if (details.length > 0) throw new ValidationError("Paramètres de recherche invalides", details);
  return data;
}

module.exports = { parseId, checkBody, checkQuery };
