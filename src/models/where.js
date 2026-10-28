// filtres sql
// filtres facultatifs
// parametres sql
// exemple filtres
// resultat filtres
function buildWhere(filters, params = []) {
  const clauses = [];
  for (const [fragment, value] of filters) {
    if (value === undefined) continue;
    params.push(value);
    clauses.push(fragment.replace("?", `$${params.length}`));
  }
  return { where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "", params };
}

// recherche partielle
function contains(value) {
  return value === undefined ? undefined : `%${value.replace(/[\\%_]/g, "\\$&")}%`;
}

module.exports = { buildWhere, contains };
