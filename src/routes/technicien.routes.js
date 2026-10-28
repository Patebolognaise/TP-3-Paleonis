const router = require("express").Router();
const ctrl = require("../controllers/technicien.controller");

// techniciens
router.get("/", ctrl.list);
router.get("/:id", ctrl.get);
router.get("/:id/tickets", ctrl.listTickets);

module.exports = router;
