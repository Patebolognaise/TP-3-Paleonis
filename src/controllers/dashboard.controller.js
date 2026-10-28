const Dashboard = require("../models/dashboard.model");

// tableau bord
exports.get = async (req, res) => {
  res.status(200).json(await Dashboard.getStats());
};
