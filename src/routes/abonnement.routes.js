const router = require("express").Router();
const ctrl = require("../controllers/abonnement.controller");

// abonnements
router.get("/", ctrl.list);
router.get("/:id", ctrl.get);
router.post("/", ctrl.souscrire);
router.patch("/:id/resiliation", ctrl.resilier);
router.patch("/:id/statut", ctrl.changerStatut);

module.exports = router;
