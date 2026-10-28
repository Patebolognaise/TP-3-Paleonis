const router = require("express").Router();
const ctrl = require("../controllers/product.controller");

// produits
router.get("/", ctrl.listProducts);
router.get("/:id", ctrl.getProduct);
router.post("/", ctrl.createProduct);

module.exports = router;
