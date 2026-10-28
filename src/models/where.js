// Assemble une clause WHERE à partir de filtres facultatifs.
// Chaque filtre est [fragment SQL avec un "?", valeur] ; il est ignoré si la valeur est undefined.
// Les valeurs passent toujours par $1, $2... : jamais concaténées dans le SQL.
//
// buildWhere([["nom ILIKE ?", "%dur%"], ["type = ?", undefined]])
//   -> { where: "WHERE nom ILIKE $1", params: ["%dur%"] }
function buildWhere(filters, params = []) {
  const clauses = [];
  for (const [fragment, value] of filters) {
    if (value === undefined) continue;
    params.push(value);
    clauses.push(fragment.replace("?", `$${params.length}`));
  }
  return { where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "", params };
}

// Recherche partielle : échappe les jokers LIKE (% et _) saisis par l'utilisateur
function contains(value) {
  return value === undefined ? undefined : `%${value.replace(/[\\%_]/g, "\\$&")}%`;
}

module.exports = { buildWhere, contains };
