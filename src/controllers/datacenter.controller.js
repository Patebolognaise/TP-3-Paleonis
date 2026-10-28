const Datacenter = require("../models/datacenter.model");
const { parseId } = require("../utils/validation");

// erreurs async

// liste datacenters
exports.list = async (req, res) => {
  res.status(200).json(await Datacenter.findAll());
};

// detail datacenter
exports.get = async (req, res) => {
  const datacenter = await Datacenter.findById(parseId(req.params.id));
  if (!datacenter) return res.status(404).json({ error: "Datacenter introuvable" });
  res.status(200).json(datacenter);
};
