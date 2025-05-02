#!/bin/bash
# static-build.sh - Script for generating and preparing a static Next.js site for Apache

echo "🚀 Starting static site generation process..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
npm run clean

# Build the static site
echo "🔨 Building static site with Next.js..."
npm run build

# Copy Apache configuration to the output directory
echo "📋 Copying Apache configuration files..."
cp .htaccess ./out/
cp robots.txt ./out/

# Create a sitemap if it doesn't exist
if [ ! -f "./out/sitemap.xml" ]; then
  echo "🗺️ Creating basic sitemap.xml..."
  cat > ./out/sitemap.xml << EOL
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <lastmod>$(date +%Y-%m-%d)</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/about/</loc>
    <lastmod>$(date +%Y-%m-%d)</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/portfolio/</loc>
    <lastmod>$(date +%Y-%m-%d)</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/workshop/</loc>
    <lastmod>$(date +%Y-%m-%d)</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/tools/</loc>
    <lastmod>$(date +%Y-%m-%d)</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
EOL
fi

# Create or update a version file for cache busting
echo "📝 Creating version.json for cache busting..."
VERSION=$(date +%Y%m%d%H%M%S)
cat > ./out/version.json << EOL
{
  "version": "${VERSION}",
  "buildDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOL

# Optimize static assets
echo "⚡ Optimizing static assets..."
if command -v find &> /dev/null && command -v gzip &> /dev/null; then
  find ./out -type f -regex ".*\.\(js\|css\|svg\|html\)" -exec gzip -9 -k {} \;
  echo "  ✅ Created gzipped versions of assets"
else
  echo "  ⚠️ gzip command not found, skipping pre-compression"
fi

# Run a simple check to ensure all necessary files exist
echo "🔍 Running final checks..."
if [ -f "./out/index.html" ]; then
  echo "  ✅ index.html exists"
else
  echo "  ❌ index.html not found!"
fi

if [ -f "./out/404.html" ]; then
  echo "  ✅ 404.html exists"
else
  echo "  ❌ 404.html not found!"
fi

# Output completion message
echo ""
echo "✅ Static site generation complete!"
echo "📁 Your site is ready in the 'out' directory"
echo "🌍 To test locally, run: npm run serve-static"
echo "🚀 To deploy to Apache, copy all files from 'out' to your web server root directory"