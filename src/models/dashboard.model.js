const pool = require("../config/db");

class Dashboard {
  // statistiques mensuelles
  // requetes paralleles
  static async getStats() {
    const [total, parCategorie, serveurs] = await Promise.all([
      pool.query(
        `SELECT COALESCE(SUM(prix_applique), 0) AS total_mensuel_ht,
                COUNT(*)::int AS abonnements_actifs
         FROM abonnement
         WHERE statut = 'actif'`
      ),
      pool.query(
        `SELECT o.categorie,
                COALESCE(SUM(a.prix_applique), 0) AS ca_mensuel_ht,
                COUNT(a.id)::int AS abonnements_actifs
         FROM offre o
         LEFT JOIN abonnement a ON a.offre_id = o.id AND a.statut = 'actif'
         GROUP BY o.categorie
         ORDER BY ca_mensuel_ht DESC`
      ),
      pool.query(
        `SELECT d.id AS datacenter_id, d.nom, d.ville,
                COUNT(s.id)::int AS total,
                COUNT(s.id) FILTER (WHERE s.statut = 'en_service')::int   AS en_service,
                COUNT(s.id) FILTER (WHERE s.statut = 'maintenance')::int  AS maintenance,
                COUNT(s.id) FILTER (WHERE s.statut = 'hors_service')::int AS hors_service,
                COUNT(s.id) FILTER (WHERE s.id IS NOT NULL AND NOT EXISTS (
                  SELECT 1 FROM abonnement a WHERE a.serveur_id = s.id AND a.statut <> 'resilie'
                ))::int AS libres
         FROM datacenter d
         LEFT JOIN serveur s ON s.datacenter_id = d.id
         GROUP BY d.id
         ORDER BY d.nom`
      ),
    ]);

    return {
      chiffre_affaires: { ...total.rows[0], par_categorie: parCategorie.rows },
      serveurs: {
        total: serveurs.rows.reduce((sum, dc) => sum + dc.total, 0),
        par_datacenter: serveurs.rows,
      },
    };
  }
}

module.exports = Dashboard;
