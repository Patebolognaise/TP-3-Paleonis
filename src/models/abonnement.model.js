const pool = require("../config/db");
const { ValidationError, NotFoundError, ConflictError } = require("../errors");
const { buildWhere } = require("./where");

// Abonnement avec son offre et son serveur éventuel (null pour un nom de domaine)
const SELECT_ABONNEMENT = `
  SELECT a.id, a.client_id, a.date_debut, a.date_fin, a.statut, a.prix_applique,
         json_build_object('id', o.id, 'nom', o.nom, 'categorie', o.categorie) AS offre,
         CASE WHEN s.id IS NULL THEN NULL ELSE json_build_object(
           'id', s.id, 'nom_hote', s.nom_hote, 'adresse_ip', host(s.adresse_ip), 'statut', s.statut,
           'datacenter_id', d.id, 'datacenter', d.nom || ' (' || d.ville || ')'
         ) END AS serveur
  FROM abonnement a
  JOIN offre o           ON o.id = a.offre_id
  LEFT JOIN serveur s    ON s.id = a.serveur_id
  LEFT JOIN datacenter d ON d.id = s.datacenter_id`;

class Abonnement {
  static async findAll({ client_id, statut } = {}) {
    const { where, params } = buildWhere([
      ["a.client_id = ?", client_id],
      ["a.statut = ?", statut],
    ]);
    const { rows } = await pool.query(
      `${SELECT_ABONNEMENT} ${where} ORDER BY a.date_debut DESC, a.id DESC`,
      params
    );
    return rows;
  }

  static async findById(id) {
    const { rows } = await pool.query(`${SELECT_ABONNEMENT} WHERE a.id = $1`, [id]);
    return rows[0] ?? null;
  }

  // B3 : souscription. Tout passe par UNE connexion dans UNE transaction :
  // soit l'abonnement est créé avec son serveur, soit rien n'est enregistré.
  static async souscrire({ client_id, offre_id, datacenter_id }) {
    const conn = await pool.connect();
    let id;
    try {
      await conn.query("BEGIN");

      const client = await conn.query("SELECT id FROM client WHERE id = $1", [client_id]);
      if (client.rowCount === 0) throw new NotFoundError("Client introuvable");

      // FOR SHARE : personne ne peut retirer ou modifier l'offre pendant la transaction
      const { rows: offres } = await conn.query(
        "SELECT id, categorie, prix_mensuel_ht, en_vente FROM offre WHERE id = $1 FOR SHARE",
        [offre_id]
      );
      const offre = offres[0];
      if (!offre) throw new NotFoundError("Offre introuvable");
      if (!offre.en_vente) throw new ConflictError("Cette offre est retirée de la vente");

      let serveurId = null;
      if (offre.categorie === "domaine") {
        if (datacenter_id !== null) {
          throw new ValidationError("datacenter_id ne doit pas être fourni pour un nom de domaine");
        }
      } else {
        if (datacenter_id === null) {
          throw new ValidationError("datacenter_id est obligatoire pour un hébergement");
        }
        const datacenter = await conn.query("SELECT id FROM datacenter WHERE id = $1", [datacenter_id]);
        if (datacenter.rowCount === 0) throw new NotFoundError("Datacenter introuvable");

        // Serveur en service sans abonnement en cours. FOR UPDATE verrouille la ligne,
        // SKIP LOCKED évite que deux souscriptions simultanées prennent le même serveur.
        const { rows: serveurs } = await conn.query(
          `SELECT s.id FROM serveur s
           WHERE s.datacenter_id = $1
             AND s.statut = 'en_service'
             AND NOT EXISTS (SELECT 1 FROM abonnement a
                             WHERE a.serveur_id = s.id AND a.statut <> 'resilie')
           ORDER BY s.id
           LIMIT 1
           FOR UPDATE SKIP LOCKED`,
          [datacenter_id]
        );
        if (serveurs.length === 0) {
          throw new ConflictError("Aucun serveur libre en service dans ce datacenter");
        }
        serveurId = serveurs[0].id;
      }

      // Le prix catalogue du moment est figé dans l'abonnement (RG3)
      const { rows } = await conn.query(
        `INSERT INTO abonnement (client_id, offre_id, serveur_id, date_debut, statut, prix_applique)
         VALUES ($1, $2, $3, CURRENT_DATE, 'actif', $4)
         RETURNING id`,
        [client_id, offre_id, serveurId, offre.prix_mensuel_ht]
      );
      id = rows[0].id;

      // Démo du ROLLBACK : avec SIMULER_PANNE_B3=1 dans le .env, la transaction échoue
      // après l'INSERT. On peut ensuite vérifier en base que rien n'a été enregistré.
      if (process.env.SIMULER_PANNE_B3 === "1") {
        throw new Error("Panne simulée au milieu de la souscription (SIMULER_PANNE_B3)");
      }

      await conn.query("COMMIT");
    } catch (err) {
      await conn.query("ROLLBACK");
      throw err;
    } finally {
      conn.release();
    }
    return Abonnement.findById(id);
  }

  // B4 : résiliation. Le serveur redevient libre de lui-même : « libre » = aucun abonnement
  // non résilié ne le référence. L'abonnement est conservé (historique, RG8).
  static async resilier(id) {
    const { rowCount } = await pool.query(
      `UPDATE abonnement SET statut = 'resilie', date_fin = GREATEST(CURRENT_DATE, date_debut)
       WHERE id = $1 AND statut <> 'resilie'`,
      [id]
    );
    if (rowCount === 0) await Abonnement.#explainNoUpdate(id);
    return Abonnement.findById(id);
  }

  // Suspendre / réactiver. Un statut inconnu est refusé par la contrainte CHECK de la base.
  static async changerStatut(id, statut) {
    if (statut === "resilie") {
      throw new ValidationError("Pour résilier, utilisez PATCH /api/abonnements/:id/resiliation");
    }
    const { rowCount } = await pool.query(
      "UPDATE abonnement SET statut = $2 WHERE id = $1 AND statut <> 'resilie'",
      [id, statut]
    );
    if (rowCount === 0) await Abonnement.#explainNoUpdate(id);
    return Abonnement.findById(id);
  }

  // Aucune ligne modifiée : l'abonnement n'existe pas, ou il est déjà résilié
  static async #explainNoUpdate(id) {
    const { rowCount } = await pool.query("SELECT 1 FROM abonnement WHERE id = $1", [id]);
    if (rowCount === 0) throw new NotFoundError("Abonnement introuvable");
    throw new ConflictError("Cet abonnement est déjà résilié");
  }
}

module.exports = Abonnement;
