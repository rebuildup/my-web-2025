import fs from "node:fs";
import path from "node:path";

function processDirectory(dir: string) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			processDirectory(fullPath);
		} else if (
			entry.isFile() &&
			(entry.name === "route.ts" || entry.name === "route.tsx")
		) {
			let content = fs.readFileSync(fullPath, "utf-8");
			if (!content.includes("export const dynamic")) {
				content = `export const dynamic = "force-static";\n${content}`;
				fs.writeFileSync(fullPath, content, "utf-8");
				console.log(`Added force-static to ${fullPath}`);
			}
		}
	}
}

const apiDir = path.join(process.cwd(), "src", "app", "api");
if (fs.existsSync(apiDir)) {
	processDirectory(apiDir);
	console.log("Finished adding force-static to all API routes.");
}
