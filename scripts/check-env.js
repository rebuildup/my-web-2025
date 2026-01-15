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

const requiredVars = ["NEXT_PUBLIC_GA_ID"];

const missing = requiredVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
	console.error(`\n[ERROR] 必須な環境変数が未設定です: ${missing.join(", ")}`);
	console.error(
		"ヒント: .env.local ファイルを作成し、NEXT_PUBLIC_GA_ID を設定してください。",
	);
	process.exit(1);
}

console.log("✅ Environment variables check passed");
