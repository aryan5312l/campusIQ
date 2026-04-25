const express = require("express");
const {syncData} = require("../controllers/syncController");
const { protect } = require("../middleware/authMiddleware");
const { getDashboard } = require("../controllers/dashboardController");

const router = express.Router();

router.post("/sync", protect, syncData);
router.get("/dashboard", protect, getDashboard);

module.exports = router;