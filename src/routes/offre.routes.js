const router = require("express").Router();
const ctrl = require("../controllers/offre.controller");

// offres
router.get("/", ctrl.list);
router.get("/:id", ctrl.get);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.patch("/:id/retrait", ctrl.retirer);

module.exports = router;
