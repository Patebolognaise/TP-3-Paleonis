const router = require("express").Router();
const ctrl = require("../controllers/serveur.controller");

// Monté sur /api/serveurs dans server.js (B6)
router.get("/", ctrl.list);
router.get("/:id", ctrl.get);
router.patch("/:id/statut", ctrl.changerStatut);

module.exports = router;
