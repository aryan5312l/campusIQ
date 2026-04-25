const academicDataModel = require("../models/academicDataModel");

// GET latest data
const getDashboard = async (req, res) => {
  const data = await academicDataModel
    .findOne({ userId: req.user._id })
    .sort({ createdAt: -1 });

  res.json({ data });
};

module.exports = {getDashboard};