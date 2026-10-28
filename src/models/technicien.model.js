const pool = require("../config/db");
const { buildWhere } = require("./where");

const SELECT_TECHNICIEN = `
  SELECT t.id, t.nom, t.prenom, t.email, t.datacenter_id, d.nom AS datacenter
  FROM technicien t
  JOIN datacenter d ON d.id = t.datacenter_id`;

class Technicien {
  static async findAll({ datacenter_id } = {}) {
    const { where, params } = buildWhere([["t.datacenter_id = ?", datacenter_id]]);
    const { rows } = await pool.query(`${SELECT_TECHNICIEN} ${where} ORDER BY t.nom, t.prenom`, params);
    return rows;
  }

  static async findById(id) {
    const { rows } = await pool.query(`${SELECT_TECHNICIEN} WHERE t.id = $1`, [id]);
    return rows[0] ?? null;
  }
}

module.exports = Technicien;
