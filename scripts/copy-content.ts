import { copyContentDb, getFromIndex } from "@/cms/lib/content-db-manager";

async function main() {
	const [, , oldId, newId] = process.argv;
	if (!oldId || !newId) {
		console.error("Usage: tsx scripts/copy-content.ts <oldId> <newId>");
		process.exit(1);
	}
	try {
		const src = getFromIndex(oldId);
		if (!src) {
			console.error(`Source not found in index: ${oldId}`);
			process.exit(2);
		}
		const ok = copyContentDb(oldId, newId);
		if (!ok) {
			console.error("copyContentDb returned false");
			process.exit(3);
		}
		console.log(`✅ Copied ${oldId} -> ${newId}`);
	} catch (e) {
		console.error(e);
		process.exit(10);
	}
}

main();
