const pool = require("../config/db");
const { buildWhere } = require("./where");

// serveur libre
// abonnement unique
const SELECT_SERVEUR = `
  SELECT s.id, s.nom_hote, host(s.adresse_ip) AS adresse_ip, s.statut, s.date_mise_en_service,
         s.datacenter_id, d.nom AS datacenter,
         (a.id IS NULL) AS libre, a.id AS abonnement_id, a.client_id
  FROM serveur s
  JOIN datacenter d      ON d.id = s.datacenter_id
  LEFT JOIN abonnement a ON a.serveur_id = s.id AND a.statut <> 'resilie'`;

class Serveur {
  // filtres serveur
  static async findAll({ datacenter_id, statut, libre } = {}) {
    const { where, params } = buildWhere([
      ["s.datacenter_id = ?", datacenter_id],
      ["s.statut = ?", statut],
      ["(a.id IS NULL) = ?", libre],
    ]);
    const { rows } = await pool.query(`${SELECT_SERVEUR} ${where} ORDER BY d.nom, s.nom_hote`, params);
    return rows;
  }

  static async findById(id) {
    const { rows } = await pool.query(`${SELECT_SERVEUR} WHERE s.id = $1`, [id]);
    return rows[0] ?? null;
  }

  // statut base
  static async changerStatut(id, statut) {
    const { rowCount } = await pool.query("UPDATE serveur SET statut = $2 WHERE id = $1", [id, statut]);
    return rowCount === 0 ? null : Serveur.findById(id);
  }
}

module.exports = Serveur;
