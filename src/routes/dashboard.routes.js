const router = require("express").Router();
const ctrl = require("../controllers/dashboard.controller");

// Monté sur /api/dashboard dans server.js (B9)
router.get("/", ctrl.get);

module.exports = router;
