const router = require("express").Router();
const ctrl = require("../controllers/dashboard.controller");

// tableau bord
router.get("/", ctrl.get);

module.exports = router;
