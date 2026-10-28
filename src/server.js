require("dotenv").config({ quiet: true }); // toujours en premier : le pool lit process.env
const express = require("express");
const pool = require("./config/db");
const datacenterRoutes = require("./routes/datacenter.routes");
const errorHandler = require("./middlewares/error.middleware");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // pour lire le JSON

app.use("/api/datacenters", datacenterRoutes);

// Middleware 404 : aucune route n'a répondu
app.use((req, res) => {
  res.status(404).json({ error: "Route inconnue" });
});

// Middleware global d'erreurs (reçoit les next(error) des contrôleurs)
app.use(errorHandler);

// Vérifie la connexion à PostgreSQL au démarrage
pool.query("SELECT NOW()")
  .then(() => console.log("Connecté à PostgreSQL"))
  .catch((err) => console.error("Connexion BDD impossible :", err.message));

app.listen(PORT, () => {
  console.log(`Serveur PaLeonis démarré sur http://localhost:${PORT}`);
});
