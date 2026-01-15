// scripts/check-env.js

const requiredVars = ["NEXT_PUBLIC_GA_ID"];

const missing = requiredVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
	console.error(`\n[ERROR] 必須な環境変数が未設定です: ${missing.join(", ")}`);
	process.exit(1);
}
