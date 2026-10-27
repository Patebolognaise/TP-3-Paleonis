require("dotenv").config({ quiet: true });
const express = require("express");
const productRoutes = require("./routes/product.routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // pour lire le JSON

app.use("/api/products", productRoutes);

// Middleware 404 : aucune route n'a répondu
app.use((req, res) => {
  res.status(404).json({ error: "Route inconnue" });
});

// Middleware global d'erreurs (reçoit les next(error) des contrôleurs)
app.use((err, req, res, next) => {
  // JSON mal formé envoyé par le client
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "JSON invalide" });
  }
  console.error(err);
  res.status(500).json({ error: "Erreur interne du serveur" });
});

app.listen(PORT, () => {
  console.log(`Serveur PaLeonis démarré sur http://localhost:${PORT}`);
});
