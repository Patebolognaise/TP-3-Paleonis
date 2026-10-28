const Offre = require("../models/offre.model");
const { parseId, checkBody, checkQuery } = require("../utils/validation");

const OFFRE_BODY = { nom: "string", categorie: "string", prix_mensuel_ht: "number" };

// GET /api/offres?categorie=&en_vente=
exports.list = async (req, res) => {
  const filters = checkQuery(req.query, { categorie: "string", en_vente: "boolean" });
  res.status(200).json(await Offre.findAll(filters));
};

// GET /api/offres/:id
exports.get = async (req, res) => {
  const offre = await Offre.findById(parseId(req.params.id));
  if (!offre) return res.status(404).json({ error: "Offre introuvable" });
  res.status(200).json(offre);
};

// POST /api/offres
exports.create = async (req, res) => {
  const offre = await Offre.create(checkBody(req.body, OFFRE_BODY));
  res.status(201).json(offre);
};

// PUT /api/offres/:id
exports.update = async (req, res) => {
  const id = parseId(req.params.id);
  const offre = await Offre.update(id, checkBody(req.body, OFFRE_BODY));
  if (!offre) return res.status(404).json({ error: "Offre introuvable" });
  res.status(200).json(offre);
};

// PATCH /api/offres/:id/retrait
exports.retirer = async (req, res) => {
  const offre = await Offre.retirer(parseId(req.params.id));
  if (!offre) return res.status(404).json({ error: "Offre introuvable" });
  res.status(200).json(offre);
};
