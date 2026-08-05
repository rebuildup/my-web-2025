import { fetchCmsContentIndex } from "../src/lib/cms-api/server-data";
import { shouldUseRustCmsApi } from "../src/lib/cms-api/config";

async function main() {
    console.log("shouldUseRustCmsApi:", shouldUseRustCmsApi());
    try {
        const index = await fetchCmsContentIndex();
        console.log("Index length:", index.length);
        if (index.length > 0) {
            console.log("Sample:", index[0]);
        }
    } catch (e) {
        console.error(e);
    }
}
main();
