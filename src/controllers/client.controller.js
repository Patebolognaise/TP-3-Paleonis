const Client = require("../models/client.model");
const { parseId, checkBody, checkQuery } = require("../utils/validation");

// validation client
const CLIENT_BODY = {
  type: "string",
  nom: "string",
  email: "string",
  telephone: "string?",
  siret: "string?",
};

// liste clients
exports.list = async (req, res) => {
  const filters = checkQuery(req.query, { nom: "string", email: "string", type: "string" });
  res.status(200).json(await Client.findAll(filters));
};

// detail client
exports.get = async (req, res) => {
  const client = await Client.findById(parseId(req.params.id));
  if (!client) return res.status(404).json({ error: "Client introuvable" });
  res.status(200).json(client);
};

// fiche client
exports.getFiche = async (req, res) => {
  const fiche = await Client.findFiche(parseId(req.params.id));
  if (!fiche) return res.status(404).json({ error: "Client introuvable" });
  res.status(200).json(fiche);
};

// creation client
exports.create = async (req, res) => {
  const client = await Client.create(checkBody(req.body, CLIENT_BODY));
  res.status(201).json(client);
};

// modification client
exports.update = async (req, res) => {
  const id = parseId(req.params.id);
  const client = await Client.update(id, checkBody(req.body, CLIENT_BODY));
  if (!client) return res.status(404).json({ error: "Client introuvable" });
  res.status(200).json(client);
};

// suppression client
exports.remove = async (req, res) => {
  await Client.delete(parseId(req.params.id));
  res.status(204).end();
};
