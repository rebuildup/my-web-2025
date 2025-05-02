# deployment.md - Deployment instructions for static Next.js website

## Overview

This document provides instructions for deploying the static Next.js website to an Apache server.

## Prerequisites

- Apache web server with mod_rewrite, mod_deflate, and mod_expires enabled
- SSH access to the server (for remote deployment)
- FTP/SFTP access (alternative deployment method)

## Local Build

1. Generate the static site by running:

   ```
   bash static-build.sh
   ```

   or

   ```
   npm run build
   ```

2. The static site will be generated in the `out` directory.

## Manual Deployment

### Option 1: Direct Copy to Web Server

1. Copy all files from the `out` directory to your Apache web server's document root (or desired subdirectory).

   ```bash
   scp -r out/* user@your-server:/path/to/web/root/
   ```

2. Ensure the `.htaccess` file was copied and is being read by Apache.

### Option 2: FTP/SFTP Upload

1. Connect to your server using an FTP/SFTP client.
2. Upload all files from the `out` directory to your web server's document root.
3. Ensure proper file permissions (typically 644 for files and 755 for directories).

## Apache Configuration

Ensure your Apache server has the following modules enabled:

```bash
sudo a2enmod rewrite
sudo a2enmod deflate
sudo a2enmod expires
sudo a2enmod headers
sudo service apache2 restart
```

Make sure your virtual host configuration allows .htaccess overrides:

```apache
<Directory /path/to/web/root>
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>
```

## Automated Deployment

For automated deployments, consider setting up one of the following:

### Using GitHub Actions

Create a `.github/workflows/deploy.yml` file:

```yaml
name: Deploy to Apache

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm ci

      - name: Build static site
        run: npm run build

      - name: Copy .htaccess and robots.txt
        run: |
          cp .htaccess ./out/
          cp robots.txt ./out/

      - name: Deploy to server
        uses: easingthemes/ssh-deploy@main
        env:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          ARGS: "-avzr --delete"
          SOURCE: "out/"
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: ${{ secrets.REMOTE_USER }}
          TARGET: ${{ secrets.REMOTE_TARGET }}
```

## Post-Deployment Checks

After deploying your static site, verify the following:

1. The home page loads correctly at your domain.
2. Internal links work properly.
3. The 404 page appears for invalid URLs.
4. Static assets (images, CSS, JS) load correctly.
5. Verify that URL clean extensions work (paths without .html).

## Troubleshooting

- **Issue**: 404 errors for pages other than index.html
  **Solution**: Ensure mod_rewrite is enabled and your .htaccess file is present and readable.

- **Issue**: 403 Forbidden errors
  **Solution**: Check file and directory permissions, ensure Apache can read the files.

- **Issue**: Incorrect paths to assets
  **Solution**: Verify the `next.config.js` settings, particularly `assetPrefix` if deploying to a subdirectory.

- **Issue**: CSS or JavaScript not loading
  **Solution**: Check the network tab in browser dev tools for the correct MIME types.
