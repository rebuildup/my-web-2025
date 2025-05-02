// scripts/generate-sitemap.js
const fs = require("fs");
const path = require("path");

/**
 * Configuration
 */
const BASE_URL = "https://yourdomain.com";
const OUTPUT_PATH = path.join(process.cwd(), "public", "sitemap.xml");

/**
 * Routes to include in the sitemap
 * These should match your actual pages
 */
const ROUTES = [
  { path: "/", priority: 1.0, changefreq: "weekly" },
  { path: "/about", priority: 0.8, changefreq: "monthly" },
  { path: "/about/real-name", priority: 0.6, changefreq: "monthly" },
  { path: "/portfolio", priority: 0.8, changefreq: "monthly" },
  { path: "/portfolio/video", priority: 0.7, changefreq: "monthly" },
  { path: "/portfolio/design", priority: 0.7, changefreq: "monthly" },
  { path: "/portfolio/code", priority: 0.7, changefreq: "monthly" },
  { path: "/workshop", priority: 0.8, changefreq: "monthly" },
  { path: "/workshop/interactive", priority: 0.7, changefreq: "monthly" },
  { path: "/workshop/tutorials", priority: 0.7, changefreq: "monthly" },
  { path: "/tools", priority: 0.8, changefreq: "monthly" },
  { path: "/tools/calculator", priority: 0.7, changefreq: "monthly" },
  { path: "/tools/converter", priority: 0.7, changefreq: "monthly" },
  { path: "/tools/generator", priority: 0.7, changefreq: "monthly" },
  { path: "/privacy-policy", priority: 0.5, changefreq: "yearly" },
  { path: "/search", priority: 0.5, changefreq: "yearly" },
];

/**
 * Generate sitemap.xml content
 */
function generateSitemap() {
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add each route to the sitemap
  ROUTES.forEach((route) => {
    const url = `${BASE_URL}${route.path === "/" ? "" : route.path}/`;

    sitemap += "  <url>\n";
    sitemap += `    <loc>${url}</loc>\n`;
    sitemap += `    <lastmod>${date}</lastmod>\n`;
    sitemap += `    <changefreq>${route.changefreq}</changefreq>\n`;
    sitemap += `    <priority>${route.priority.toFixed(1)}</priority>\n`;
    sitemap += "  </url>\n";
  });

  sitemap += "</urlset>";

  return sitemap;
}

/**
 * Write the sitemap to file
 */
function writeSitemap() {
  const sitemap = generateSitemap();

  // Ensure the directory exists
  const dir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write the file
  fs.writeFileSync(OUTPUT_PATH, sitemap);

  console.log(`Sitemap generated at: ${OUTPUT_PATH}`);
}

// Execute the script
writeSitemap();
