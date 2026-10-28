const { ValidationError } = require("../errors");

// entier postgres
const INT_MAX = 2147483647;

function isId(value) {
  return Number.isInteger(value) && value > 0 && value <= INT_MAX;
}

// id url
function parseId(value, field = "id") {
  const id = /^\d+$/.test(value) ? Number(value) : NaN;
  if (!isId(id)) throw new ValidationError(`${field} doit être un entier strictement positif`);
  return id;
}

// validation champ
// regles base
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

// validation corps
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

// validation filtres
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
