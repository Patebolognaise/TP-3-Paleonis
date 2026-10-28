const router = require("express").Router();
const ctrl = require("../controllers/ticket.controller");

// tickets
router.get("/", ctrl.list);
router.get("/:id", ctrl.get);
router.post("/", ctrl.create);
router.patch("/:id/assignation", ctrl.assigner);
router.patch("/:id/statut", ctrl.changerStatut);

module.exports = router;
