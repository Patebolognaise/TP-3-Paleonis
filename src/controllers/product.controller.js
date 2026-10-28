const { Product, ValidationError } = require("../models/product.model");

// liste produits
exports.listProducts = (req, res, next) => {
  try {
    const products = Product.findAll();
    return res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

// detail produit
exports.getProduct = (req, res, next) => {
  try {
    const product = Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Produit non trouvé" });
    return res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// creation produit
exports.createProduct = (req, res, next) => {
  try {
    const product = Product.createOne(req.body);
    return res.status(201).json(product);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};
