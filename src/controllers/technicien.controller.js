const Technicien = require("../models/technicien.model");
const Ticket = require("../models/ticket.model");
const { parseId, checkQuery } = require("../utils/validation");

// GET /api/techniciens?datacenter_id=
exports.list = async (req, res) => {
  const filters = checkQuery(req.query, { datacenter_id: "id" });
  res.status(200).json(await Technicien.findAll(filters));
};

// GET /api/techniciens/:id
exports.get = async (req, res) => {
  const technicien = await Technicien.findById(parseId(req.params.id));
  if (!technicien) return res.status(404).json({ error: "Technicien introuvable" });
  res.status(200).json(technicien);
};

// GET /api/techniciens/:id/tickets (B8)
exports.listTickets = async (req, res) => {
  const id = parseId(req.params.id);
  const technicien = await Technicien.findById(id);
  if (!technicien) return res.status(404).json({ error: "Technicien introuvable" });
  res.status(200).json(await Ticket.findNonFermesByTechnicien(id));
};
