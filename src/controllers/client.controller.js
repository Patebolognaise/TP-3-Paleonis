const Client = require("../models/client.model");
const { parseId, checkBody, checkQuery } = require("../utils/validation");

// Forme attendue du body ; les valeurs métier sont contrôlées par la base
const CLIENT_BODY = {
  type: "string",
  nom: "string",
  email: "string",
  telephone: "string?",
  siret: "string?",
};

// GET /api/clients?nom=&email=&type=
exports.list = async (req, res) => {
  const filters = checkQuery(req.query, { nom: "string", email: "string", type: "string" });
  res.status(200).json(await Client.findAll(filters));
};

// GET /api/clients/:id
exports.get = async (req, res) => {
  const client = await Client.findById(parseId(req.params.id));
  if (!client) return res.status(404).json({ error: "Client introuvable" });
  res.status(200).json(client);
};

// GET /api/clients/:id/fiche
exports.getFiche = async (req, res) => {
  const fiche = await Client.findFiche(parseId(req.params.id));
  if (!fiche) return res.status(404).json({ error: "Client introuvable" });
  res.status(200).json(fiche);
};

// POST /api/clients
exports.create = async (req, res) => {
  const client = await Client.create(checkBody(req.body, CLIENT_BODY));
  res.status(201).json(client);
};

// PUT /api/clients/:id
exports.update = async (req, res) => {
  const id = parseId(req.params.id);
  const client = await Client.update(id, checkBody(req.body, CLIENT_BODY));
  if (!client) return res.status(404).json({ error: "Client introuvable" });
  res.status(200).json(client);
};

// DELETE /api/clients/:id
exports.remove = async (req, res) => {
  await Client.delete(parseId(req.params.id));
  res.status(204).end();
};
