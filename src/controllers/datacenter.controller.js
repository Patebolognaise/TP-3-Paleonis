const Datacenter = require("../models/datacenter.model");
const { parseId } = require("../utils/validation");

// Express 5 transmet tout seul les erreurs des fonctions async au middleware d'erreurs

// GET /api/datacenters
exports.list = async (req, res) => {
  res.status(200).json(await Datacenter.findAll());
};

// GET /api/datacenters/:id
exports.get = async (req, res) => {
  const datacenter = await Datacenter.findById(parseId(req.params.id));
  if (!datacenter) return res.status(404).json({ error: "Datacenter introuvable" });
  res.status(200).json(datacenter);
};
