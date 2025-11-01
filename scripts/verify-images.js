/**
 * Image Verification Script
 * Verifies that all referenced images exist in the public directory
 */

const fs = require("node:fs");
const path = require("node:path");

async function verifyImages() {
	console.log("🔍 Verifying portfolio images...");

	try {
		// Read portfolio data
		const portfolioPath = path.join(
			process.cwd(),
			"public/data/content/portfolio.json",
		);
		if (!fs.existsSync(portfolioPath)) {
			console.info(
				"ℹ️  Portfolio data not found. Skipping image verification step.",
			);
			return;
		}

		const portfolioData = JSON.parse(fs.readFileSync(portfolioPath, "utf-8"));

		let totalImages = 0;
		let missingImages = 0;
		const missingList = [];

		for (const item of portfolioData) {
			// Check thumbnail (skip external URLs)
			if (item.thumbnail && !item.thumbnail.startsWith("http")) {
				totalImages++;
				const imagePath = path.join(process.cwd(), "public", item.thumbnail);
				if (!fs.existsSync(imagePath)) {
					missingImages++;
					missingList.push({
						item: item.id,
						type: "thumbnail",
						path: item.thumbnail,
					});
				}
			}

			// Check images array (skip external URLs)
			if (item.images && Array.isArray(item.images)) {
				for (const image of item.images) {
					if (!image.startsWith("http")) {
						totalImages++;
						const imagePath = path.join(process.cwd(), "public", image);
						if (!fs.existsSync(imagePath)) {
							missingImages++;
							missingList.push({
								item: item.id,
								type: "image",
								path: image,
							});
						}
					}
				}
			}

			// Check processedImages array (skip external URLs)
			if (item.processedImages && Array.isArray(item.processedImages)) {
				for (const image of item.processedImages) {
					if (!image.startsWith("http")) {
						totalImages++;
						const imagePath = path.join(process.cwd(), "public", image);
						if (!fs.existsSync(imagePath)) {
							missingImages++;
							missingList.push({
								item: item.id,
								type: "processedImage",
								path: image,
							});
						}
					}
				}
			}
		}

		console.log(`📊 Image verification results:`);
		console.log(`   Total images referenced: ${totalImages}`);
		console.log(`   Missing images: ${missingImages}`);
		console.log(
			`   Success rate: ${(((totalImages - missingImages) / totalImages) * 100).toFixed(1)}%`,
		);

		if (missingImages > 0) {
			console.log("\n❌ Missing images:");
			missingList.forEach((missing) => {
				console.log(`   ${missing.item} (${missing.type}): ${missing.path}`);
			});

			// Create missing images report
			const reportPath = path.join(process.cwd(), "missing-images-report.json");
			fs.writeFileSync(reportPath, JSON.stringify(missingList, null, 2));
			console.log(`\n📄 Missing images report saved to: ${reportPath}`);

			process.exit(1);
		} else {
			console.log("\n✅ All images verified successfully!");
		}
	} catch (error) {
		console.error("❌ Error verifying images:", error);
		process.exit(1);
	}
}

// Check if placeholder image exists
function checkPlaceholderImage() {
	const placeholderPath = path.join(
		process.cwd(),
		"public/images/portfolio/placeholder-image.svg",
	);
	if (!fs.existsSync(placeholderPath)) {
		console.info("ℹ️  Placeholder image not found, creating one...");

		fs.mkdirSync(path.dirname(placeholderPath), { recursive: true });

		const placeholderSvg = `<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#f3f4f6"/>
  <rect x="1" y="1" width="398" height="298" stroke="#e5e7eb" stroke-width="2"/>
  <circle cx="200" cy="120" r="30" fill="#d1d5db"/>
  <path d="M170 150 L200 120 L230 150 L260 120 L290 150 L320 120" stroke="#9ca3af" stroke-width="2" fill="none"/>
  <rect x="150" y="200" width="100" height="20" fill="#e5e7eb"/>
  <rect x="170" y="230" width="60" height="15" fill="#d1d5db"/>
</svg>`;

		fs.writeFileSync(placeholderPath, placeholderSvg);
		console.log("✅ Placeholder image created");
	}
}

if (require.main === module) {
	checkPlaceholderImage();
	verifyImages();
}

module.exports = { verifyImages, checkPlaceholderImage };
