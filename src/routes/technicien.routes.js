const router = require("express").Router();
const ctrl = require("../controllers/technicien.controller");

// Monté sur /api/techniciens dans server.js (lecture seule, B8, B10)
router.get("/", ctrl.list);
router.get("/:id", ctrl.get);
router.get("/:id/tickets", ctrl.listTickets);

module.exports = router;
