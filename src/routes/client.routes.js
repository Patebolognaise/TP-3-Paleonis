const router = require("express").Router();
const ctrl = require("../controllers/client.controller");

// clients
router.get("/", ctrl.list);
router.get("/:id", ctrl.get);
router.get("/:id/fiche", ctrl.getFiche);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;
