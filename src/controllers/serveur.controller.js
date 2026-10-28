const Serveur = require("../models/serveur.model");
const { parseId, checkBody, checkQuery } = require("../utils/validation");

// GET /api/serveurs?datacenter_id=&statut=&libre=
exports.list = async (req, res) => {
  const filters = checkQuery(req.query, { datacenter_id: "id", statut: "string", libre: "boolean" });
  res.status(200).json(await Serveur.findAll(filters));
};

// GET /api/serveurs/:id
exports.get = async (req, res) => {
  const serveur = await Serveur.findById(parseId(req.params.id));
  if (!serveur) return res.status(404).json({ error: "Serveur introuvable" });
  res.status(200).json(serveur);
};

// PATCH /api/serveurs/:id/statut
exports.changerStatut = async (req, res) => {
  const id = parseId(req.params.id);
  const { statut } = checkBody(req.body, { statut: "string" });
  const serveur = await Serveur.changerStatut(id, statut);
  if (!serveur) return res.status(404).json({ error: "Serveur introuvable" });
  res.status(200).json(serveur);
};
