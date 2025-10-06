const ShockReferral = require("../models/ShockReferral");
const fetch = (...args) =>
	import("node-fetch").then(({ default: fetch }) => fetch(...args));

const SHOCK_API_KEY = "429931df-dd18-48d5-b206-ad0c512a6ed9";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let lastFetch = 0;
let cachedData = null;

exports.getReferrals = async (req, res) => {
	try {
		const now = Date.now();

		// Use cache if valid
		if (cachedData && now - lastFetch < CACHE_DURATION) {
			console.log("✅ Returning cached Shock referrals");
			return res.json(cachedData);
		}

		console.log("🌐 Fetching new Shock referrals...");
		const response = await fetch("https://shock.com/api/v1/get-referrals", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				apiKey: SHOCK_API_KEY,
				// minDate: new Date("2021-10-01").getTime(),
				// maxDate: new Date("2025-04-31").getTime(),
			}),
		});

		if (!response.ok) throw new Error(`Shock API error: ${response.status}`);
		const data = await response.json();

		// Cache results in memory
		cachedData = data;
		lastFetch = now;

		// Save to MongoDB
		await ShockReferral.deleteMany({});

		const formatted = Array.isArray(data)
			? data.map((item) => ({
					username: item.username || "unknown",
					totalReferrals: item.totalReferrals || item.referrals || 0,
					earnings: item.earnings || 0,
					wager: item.wager || 0, // ✅ added wager
					data: item,
			  }))
			: [];

		await ShockReferral.insertMany(formatted);

		res.json(formatted);
	} catch (error) {
		console.error("❌ Error fetching Shock referrals:", error);
		res.status(500).json({ error: "Failed to fetch Shock referrals" });
	}
};
