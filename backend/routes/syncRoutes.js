const express = require("express");
const {syncData} = require("../controllers/syncController");

const router = express.Router();

router.post("/sync", syncData);

module.exports = router;