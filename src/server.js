require("dotenv").config({ quiet: true }); // toute première ligne : le pool lit process.env
const express = require("express");
const pool = require("./config/db");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const datacenterRoutes = require("./routes/datacenter.routes");
const clientRoutes = require("./routes/client.routes");
const offreRoutes = require("./routes/offre.routes");
const abonnementRoutes = require("./routes/abonnement.routes");
const serveurRoutes = require("./routes/serveur.routes");
const ticketRoutes = require("./routes/ticket.routes");
const technicienRoutes = require("./routes/technicien.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // pour lire le JSON

app.use("/api/datacenters", datacenterRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/offres", offreRoutes);
app.use("/api/abonnements", abonnementRoutes);
app.use("/api/serveurs", serveurRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/techniciens", technicienRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Middleware 404 : aucune route n'a répondu
app.use(notFound);

// Middleware global d'erreurs : erreurs métier et erreurs PostgreSQL -> codes HTTP
app.use(errorHandler);

pool.query("SELECT NOW()")
  .then(() => console.log("Connecté à PostgreSQL"))
  .catch((err) => console.error("Connexion BDD impossible :", err.message));

app.listen(PORT, () => {
  console.log(`Serveur PaLeonis démarré sur http://localhost:${PORT}`);
});
