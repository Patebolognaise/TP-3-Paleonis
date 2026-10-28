// erreur validation
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

class Product {
  #id;
  #name;
  #price;

  // donnees memoire
  static #nextId = 4;
  static #data = [
    new Product(1, "Serveur VPS", 19.99),
    new Product(2, "Nom de domaine", 9.99),
    new Product(3, "Hébergement mutualisé", 4.99),
  ];

  constructor(id, name, price) {
    Product.#validate(name, price);
    this.#id = id;
    this.#name = name.trim();
    this.#price = price;
  }

  // getters
  get id() {
    return this.#id;
  }

  get name() {
    return this.#name;
  }

  get price() {
    return this.#price;
  }

  // sortie json
  toJSON() {
    return { id: this.#id, name: this.#name, price: this.#price };
  }

  // validation produit
  static #validate(name, price) {
    if (typeof name !== "string" || name.trim() === "") {
      throw new ValidationError("name (string non vide) est requis");
    }
    if (typeof price !== "number" || !Number.isFinite(price)) {
      throw new ValidationError("price (number) est requis");
    }
    if (price < 0) {
      throw new ValidationError("price ne doit jamais être négatif");
    }
  }

  static findAll() {
    return [...Product.#data];
  }

  static findById(id) {
    return Product.#data.find(p => p.id === Number(id)) || null;
  }

  static createOne(dto = {}) {
    const product = new Product(Product.#nextId, dto.name, dto.price);
    Product.#nextId++;
    Product.#data.push(product);
    return product;
  }
}

module.exports = { Product, ValidationError };
