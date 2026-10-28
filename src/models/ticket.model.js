const pool = require("../config/db");
const { NotFoundError, ConflictError, BusinessRuleError } = require("../errors");
const { buildWhere } = require("./where");

const SELECT_TICKET = `
  SELECT t.id, t.sujet, t.description, t.date_ouverture, t.priorite, t.statut,
         t.client_id, c.nom AS client,
         t.serveur_id, s.nom_hote AS serveur,
         t.technicien_id, te.prenom || ' ' || te.nom AS technicien
  FROM ticket t
  JOIN client c           ON c.id = t.client_id
  LEFT JOIN serveur s     ON s.id = t.serveur_id
  LEFT JOIN technicien te ON te.id = t.technicien_id`;

// cycle ticket
const TRANSITIONS = {
  ouvert: ["en_cours", "ferme"],
  en_cours: ["resolu", "ouvert"],
  resolu: ["ferme", "en_cours"],
  ferme: [],
};

class Ticket {
  static async findAll({ statut, priorite, client_id, technicien_id } = {}) {
    const { where, params } = buildWhere([
      ["t.statut = ?", statut],
      ["t.priorite = ?", priorite],
      ["t.client_id = ?", client_id],
      ["t.technicien_id = ?", technicien_id],
    ]);
    const { rows } = await pool.query(`${SELECT_TICKET} ${where} ORDER BY t.date_ouverture DESC`, params);
    return rows;
  }

  static async findById(id) {
    const { rows } = await pool.query(`${SELECT_TICKET} WHERE t.id = $1`, [id]);
    return rows[0] ?? null;
  }

  // tickets technicien
  static async findNonFermesByTechnicien(technicienId) {
    const { rows } = await pool.query(
      `${SELECT_TICKET}
       WHERE t.technicien_id = $1 AND t.statut <> 'ferme'
       ORDER BY array_position(ARRAY['critique', 'haute', 'normale', 'basse']::varchar[], t.priorite),
                t.date_ouverture`,
      [technicienId]
    );
    return rows;
  }

  // creation ticket
  static async create({ client_id, sujet, description, priorite, serveur_id }) {
    const client = await pool.query("SELECT id FROM client WHERE id = $1", [client_id]);
    if (client.rowCount === 0) throw new NotFoundError("Client introuvable");

    if (serveur_id !== null) {
      const serveur = await pool.query(
        `SELECT s.id, a.id AS abonnement_id
         FROM serveur s
         LEFT JOIN abonnement a ON a.serveur_id = s.id AND a.client_id = $2 AND a.statut <> 'resilie'
         WHERE s.id = $1`,
        [serveur_id, client_id]
      );
      if (serveur.rowCount === 0) throw new NotFoundError("Serveur introuvable");
      if (serveur.rows[0].abonnement_id === null) {
        throw new BusinessRuleError("Ce serveur n'est pas attribué à ce client");
      }
    }

    const { rows } = await pool.query(
      `INSERT INTO ticket (client_id, sujet, description, priorite, serveur_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [client_id, sujet, description, priorite ?? "normale", serveur_id]
    );
    return Ticket.findById(rows[0].id);
  }

  // assignation ticket
  static async assigner(id, technicienId) {
    const { rowCount } = await pool.query(
      "UPDATE ticket SET technicien_id = $2 WHERE id = $1 AND statut <> 'ferme'",
      [id, technicienId]
    );
    if (rowCount === 0) {
      const ticket = await Ticket.findById(id);
      if (!ticket) throw new NotFoundError("Ticket introuvable");
      throw new ConflictError("Un ticket fermé ne peut plus être assigné");
    }
    return Ticket.findById(id);
  }

  // changement statut
  static async changerStatut(id, statut) {
    if (!(statut in TRANSITIONS)) {
      throw new BusinessRuleError("statut doit valoir ouvert, en_cours, resolu ou ferme");
    }
    const ticket = await Ticket.findById(id);
    if (!ticket) throw new NotFoundError("Ticket introuvable");
    if (!TRANSITIONS[ticket.statut].includes(statut)) {
      throw new ConflictError(`Transition interdite : ${ticket.statut} -> ${statut}`);
    }
    if (statut === "en_cours" && ticket.technicien_id === null) {
      throw new ConflictError("Le ticket doit être assigné à un technicien avant de passer en_cours");
    }
    // verification statut
    const { rowCount } = await pool.query(
      "UPDATE ticket SET statut = $2 WHERE id = $1 AND statut = $3",
      [id, statut, ticket.statut]
    );
    if (rowCount === 0) throw new ConflictError("Le ticket a été modifié entre-temps, réessayez");
    return Ticket.findById(id);
  }
}

module.exports = Ticket;
