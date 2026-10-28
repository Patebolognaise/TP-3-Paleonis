const Abonnement = require("../models/abonnement.model");
const { parseId, checkBody, checkQuery } = require("../utils/validation");

// GET /api/abonnements?client_id=&statut=
exports.list = async (req, res) => {
  const filters = checkQuery(req.query, { client_id: "id", statut: "string" });
  res.status(200).json(await Abonnement.findAll(filters));
};

// GET /api/abonnements/:id
exports.get = async (req, res) => {
  const abonnement = await Abonnement.findById(parseId(req.params.id));
  if (!abonnement) return res.status(404).json({ error: "Abonnement introuvable" });
  res.status(200).json(abonnement);
};

// POST /api/abonnements (B3)
exports.souscrire = async (req, res) => {
  const data = checkBody(req.body, { client_id: "id", offre_id: "id", datacenter_id: "id?" });
  res.status(201).json(await Abonnement.souscrire(data));
};

// PATCH /api/abonnements/:id/resiliation (B4)
exports.resilier = async (req, res) => {
  res.status(200).json(await Abonnement.resilier(parseId(req.params.id)));
};

// PATCH /api/abonnements/:id/statut
exports.changerStatut = async (req, res) => {
  const id = parseId(req.params.id);
  const { statut } = checkBody(req.body, { statut: "string" });
  res.status(200).json(await Abonnement.changerStatut(id, statut));
};
