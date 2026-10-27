const router = require("express").Router();
const ctrl = require("../controllers/product.controller");

// Monté sur /api/products dans server.js
router.get("/", ctrl.listProducts);
router.get("/:id", ctrl.getProduct);
router.post("/", ctrl.createProduct);

module.exports = router;
