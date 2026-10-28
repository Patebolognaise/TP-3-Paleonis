const pool = require("../config/db");
const { NotFoundError } = require("../errors");
const { buildWhere, contains } = require("./where");

const COLUMNS = "id, type, nom, email, telephone, siret, date_inscription";

class Client {
  // B1 : liste, avec recherche partielle insensible à la casse sur le nom et l'email
  static async findAll({ nom, email, type } = {}) {
    const { where, params } = buildWhere([
      ["nom ILIKE ?", contains(nom)],
      ["email ILIKE ?", contains(email)],
      ["type = ?", type],
    ]);
    const { rows } = await pool.query(`SELECT ${COLUMNS} FROM client ${where} ORDER BY nom, id`, params);
    return rows;
  }

  static async findById(id) {
    const { rows } = await pool.query(`SELECT ${COLUMNS} FROM client WHERE id = $1`, [id]);
    return rows[0] ?? null;
  }

  // B5 : informations du client + abonnements avec l'offre et le serveur éventuel
  static async findFiche(id) {
    const client = await Client.findById(id);
    if (!client) return null;

    const { rows } = await pool.query(
      `SELECT a.id, a.date_debut, a.date_fin, a.statut, a.prix_applique,
              json_build_object('id', o.id, 'nom', o.nom, 'categorie', o.categorie) AS offre,
              CASE WHEN s.id IS NULL THEN NULL ELSE json_build_object(
                'id', s.id, 'nom_hote', s.nom_hote, 'adresse_ip', host(s.adresse_ip), 'statut', s.statut,
                'datacenter_id', d.id, 'datacenter', d.nom || ' (' || d.ville || ')'
              ) END AS serveur
       FROM abonnement a
       JOIN offre o           ON o.id = a.offre_id
       LEFT JOIN serveur s    ON s.id = a.serveur_id
       LEFT JOIN datacenter d ON d.id = s.datacenter_id
       WHERE a.client_id = $1
       ORDER BY a.date_debut DESC, a.id DESC`,
      [id]
    );
    return { ...client, abonnements: rows };
  }

  // Les contraintes (type, email unique et bien formé, SIRET si entreprise...) sont vérifiées par la base
  static async create({ type, nom, email, telephone, siret }) {
    const { rows } = await pool.query(
      `INSERT INTO client (type, nom, email, telephone, siret)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${COLUMNS}`,
      [type, nom, email.toLowerCase(), telephone, siret]
    );
    return rows[0];
  }

  // Remplacement complet ; date_inscription n'est pas modifiable
  static async update(id, { type, nom, email, telephone, siret }) {
    const { rows } = await pool.query(
      `UPDATE client
       SET type = $2, nom = $3, email = $4, telephone = $5, siret = $6
       WHERE id = $1
       RETURNING ${COLUMNS}`,
      [id, type, nom, email.toLowerCase(), telephone, siret]
    );
    return rows[0] ?? null;
  }

  // RG8 : le trigger de la base refuse la suppression si un abonnement est encore actif ou suspendu
  static async delete(id) {
    const { rowCount } = await pool.query("DELETE FROM client WHERE id = $1", [id]);
    if (rowCount === 0) throw new NotFoundError("Client introuvable");
  }
}

module.exports = Client;
