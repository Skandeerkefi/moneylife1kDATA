const express = require("express");
const router = express.Router();
const { getReferrals } = require("../controllers/shockController");

router.get("/referrals", getReferrals);

module.exports = router;
