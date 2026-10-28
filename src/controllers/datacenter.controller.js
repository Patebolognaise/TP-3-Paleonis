const Datacenter = require("../models/datacenter.model");

// GET /api/datacenters
exports.listDatacenters = async (req, res, next) => {
  try {
    const datacenters = await Datacenter.findAll();
    return res.status(200).json(datacenters);
  } catch (error) {
    next(error);
  }
};

// GET /api/datacenters/:id
exports.getDatacenter = async (req, res, next) => {
  try {
    const datacenter = await Datacenter.findById(req.params.id);
    if (!datacenter) {
      return res.status(404).json({ error: "Datacenter non trouvé" });
    }
    return res.status(200).json(datacenter);
  } catch (error) {
    next(error);
  }
};
