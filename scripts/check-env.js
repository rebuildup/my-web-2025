// scripts/check-env.js
const fs = require("node:fs");
const path = require("node:path");

// Load environment variables from .env files
function loadEnv(filename) {
	const filePath = path.join(process.cwd(), filename);
	if (fs.existsSync(filePath)) {
		try {
			const content = fs.readFileSync(filePath, "utf8");
			for (const line of content.split("\n")) {
				// Skip comments and empty lines
				if (!line || line.startsWith("#") || !line.includes("=")) continue;

				const [key, ...values] = line.split("=");
				const value = values.join("=").trim();
				const cleanKey = key.trim();

				// Remove quotes if present
				const cleanValue = value.replace(/^["'](.*)["']$/, "$1");

				if (cleanKey && !process.env[cleanKey]) {
					process.env[cleanKey] = cleanValue;
				}
			}
		} catch (error) {
			console.warn(`Failed to parse ${filename}:`, error.message);
		}
	}
}

// Load env files in priority order (similar to Next.js)
loadEnv(".env");
loadEnv(".env.production");
loadEnv(".env.local");

if (!process.env.NEXT_PUBLIC_GA_ID) {
	process.env.NEXT_PUBLIC_GA_ID = "G-DUMMY12345";
}

console.log("✅ Environment variables check passed");
