// Middleware global d'erreurs : un seul format { error: "..." } dans toute l'API.
// Les contraintes sont dans la base : on traduit ses codes d'erreur en codes HTTP.
module.exports = (err, req, res, next) => {
  // JSON mal formé envoyé par le client
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "JSON invalide" });
  }

  switch (err.code) {
    case "23505": // unique_violation
      return res.status(409).json({ error: "Valeur déjà existante", detail: err.detail });
    case "23503": // foreign_key_violation
      // DELETE bloqué par une référence -> 409 ; référence inexistante à l'insertion -> 404
      if (req.method === "DELETE") {
        return res.status(409).json({ error: "Suppression impossible : la ressource est encore utilisée", detail: err.detail });
      }
      return res.status(404).json({ error: "Ressource référencée inexistante", detail: err.detail });
    case "23514": // check_violation
      return res.status(422).json({ error: "Valeur non autorisée", detail: err.constraint });
    case "23502": // not_null_violation
      return res.status(400).json({ error: `Champ obligatoire manquant : ${err.column}` });
    case "22P02": // invalid_text_representation
      return res.status(400).json({ error: "Format invalide" });
  }

  console.error(err);
  return res.status(500).json({ error: "Erreur interne du serveur" });
};
