import { loadContentByType } from "../src/lib/data";

async function main() {
    try {
        const items = await loadContentByType("portfolio");
        console.log("portfolio items length:", items.length);
        if (items.length > 0) {
            console.log("first item:", items[0].id);
        }
    } catch (e) {
        console.error(e);
    }
}
main();
