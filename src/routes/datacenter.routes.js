const router = require("express").Router();
const ctrl = require("../controllers/datacenter.controller");

// Monté sur /api/datacenters dans server.js (lecture seule, B10)
router.get("/", ctrl.list);
router.get("/:id", ctrl.get);

module.exports = router;
