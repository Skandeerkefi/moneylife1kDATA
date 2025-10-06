const mongoose = require("mongoose");

const shockReferralSchema = new mongoose.Schema(
	{
		username: { type: String, required: true },
		totalReferrals: { type: Number, default: 0 },
		earnings: { type: Number, default: 0 },
		wager: { type: Number, default: 0 }, // ✅ added wager
		data: Object, // keep full API response if needed
	},
	{ timestamps: true }
);

module.exports = mongoose.model("ShockReferral", shockReferralSchema);
