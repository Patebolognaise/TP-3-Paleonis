const router = require("express").Router();
const ctrl = require("../controllers/datacenter.controller");

// datacenters
router.get("/", ctrl.list);
router.get("/:id", ctrl.get);

module.exports = router;
