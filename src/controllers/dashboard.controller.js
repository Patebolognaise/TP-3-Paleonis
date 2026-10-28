const Dashboard = require("../models/dashboard.model");

// GET /api/dashboard (B9)
exports.get = async (req, res) => {
  res.status(200).json(await Dashboard.getStats());
};
