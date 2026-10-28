const pool = require("../config/db");
const { buildWhere } = require("./where");

const COLUMNS = "id, nom, categorie, prix_mensuel_ht, en_vente";

class Offre {
  // B2 : catalogue filtrable par catégorie et par disponibilité
  static async findAll({ categorie, en_vente } = {}) {
    const { where, params } = buildWhere([
      ["categorie = ?", categorie],
      ["en_vente = ?", en_vente],
    ]);
    const { rows } = await pool.query(
      `SELECT ${COLUMNS} FROM offre ${where} ORDER BY categorie, prix_mensuel_ht, id`,
      params
    );
    return rows;
  }

  static async findById(id) {
    const { rows } = await pool.query(`SELECT ${COLUMNS} FROM offre WHERE id = $1`, [id]);
    return rows[0] ?? null;
  }

  // Prix >= 0, catégorie autorisée et nom unique : contrôlés par la base
  static async create({ nom, categorie, prix_mensuel_ht }) {
    const { rows } = await pool.query(
      `INSERT INTO offre (nom, categorie, prix_mensuel_ht)
       VALUES ($1, $2, $3)
       RETURNING ${COLUMNS}`,
      [nom, categorie, prix_mensuel_ht]
    );
    return rows[0];
  }

  // Les abonnements existants gardent leur prix_applique (RG3)
  static async update(id, { nom, categorie, prix_mensuel_ht }) {
    const { rows } = await pool.query(
      `UPDATE offre SET nom = $2, categorie = $3, prix_mensuel_ht = $4
       WHERE id = $1
       RETURNING ${COLUMNS}`,
      [id, nom, categorie, prix_mensuel_ht]
    );
    return rows[0] ?? null;
  }

  // RG2 : on retire de la vente, on ne supprime pas
  static async retirer(id) {
    const { rows } = await pool.query(
      `UPDATE offre SET en_vente = FALSE WHERE id = $1 RETURNING ${COLUMNS}`,
      [id]
    );
    return rows[0] ?? null;
  }
}

module.exports = Offre;
