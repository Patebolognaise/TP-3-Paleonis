const router = require("express").Router();
const ctrl = require("../controllers/offre.controller");

// Monté sur /api/offres dans server.js (B2). Pas de DELETE : une offre se retire (RG2).
router.get("/", ctrl.list);
router.get("/:id", ctrl.get);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.patch("/:id/retrait", ctrl.retirer);

module.exports = router;
