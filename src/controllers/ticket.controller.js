const Ticket = require("../models/ticket.model");
const { parseId, checkBody, checkQuery } = require("../utils/validation");

// GET /api/tickets?statut=&priorite=&client_id=&technicien_id=
exports.list = async (req, res) => {
  const filters = checkQuery(req.query, {
    statut: "string",
    priorite: "string",
    client_id: "id",
    technicien_id: "id",
  });
  res.status(200).json(await Ticket.findAll(filters));
};

// GET /api/tickets/:id
exports.get = async (req, res) => {
  const ticket = await Ticket.findById(parseId(req.params.id));
  if (!ticket) return res.status(404).json({ error: "Ticket introuvable" });
  res.status(200).json(ticket);
};

// POST /api/tickets
exports.create = async (req, res) => {
  const data = checkBody(req.body, {
    client_id: "id",
    sujet: "string",
    description: "string",
    priorite: "string?",
    serveur_id: "id?",
  });
  res.status(201).json(await Ticket.create(data));
};

// PATCH /api/tickets/:id/assignation
exports.assigner = async (req, res) => {
  const id = parseId(req.params.id);
  const { technicien_id } = checkBody(req.body, { technicien_id: "id" });
  res.status(200).json(await Ticket.assigner(id, technicien_id));
};

// PATCH /api/tickets/:id/statut
exports.changerStatut = async (req, res) => {
  const id = parseId(req.params.id);
  const { statut } = checkBody(req.body, { statut: "string" });
  res.status(200).json(await Ticket.changerStatut(id, statut));
};
