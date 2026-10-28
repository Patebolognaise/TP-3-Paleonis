const Offre = require("../models/offre.model");
const { parseId, checkBody, checkQuery } = require("../utils/validation");

const OFFRE_BODY = { nom: "string", categorie: "string", prix_mensuel_ht: "number" };

// liste offres
exports.list = async (req, res) => {
  const filters = checkQuery(req.query, { categorie: "string", en_vente: "boolean" });
  res.status(200).json(await Offre.findAll(filters));
};

// detail offre
exports.get = async (req, res) => {
  const offre = await Offre.findById(parseId(req.params.id));
  if (!offre) return res.status(404).json({ error: "Offre introuvable" });
  res.status(200).json(offre);
};

// creation offre
exports.create = async (req, res) => {
  const offre = await Offre.create(checkBody(req.body, OFFRE_BODY));
  res.status(201).json(offre);
};

// modification offre
exports.update = async (req, res) => {
  const id = parseId(req.params.id);
  const offre = await Offre.update(id, checkBody(req.body, OFFRE_BODY));
  if (!offre) return res.status(404).json({ error: "Offre introuvable" });
  res.status(200).json(offre);
};

// retrait offre
exports.retirer = async (req, res) => {
  const offre = await Offre.retirer(parseId(req.params.id));
  if (!offre) return res.status(404).json({ error: "Offre introuvable" });
  res.status(200).json(offre);
};
