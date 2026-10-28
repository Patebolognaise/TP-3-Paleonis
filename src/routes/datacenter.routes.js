const router = require("express").Router();
const ctrl = require("../controllers/datacenter.controller");

// Monté sur /api/datacenters dans server.js (B10 : lecture seule)
router.get("/", ctrl.listDatacenters);
router.get("/:id", ctrl.getDatacenter);

module.exports = router;
