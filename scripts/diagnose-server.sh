#!/bin/bash
# サーバー診断スクリプト
# 使用方法: ssh deploy@<GCP_HOST> 'bash -s' < scripts/diagnose-server.sh

set -e

echo "=== Server Diagnostics ==="
echo ""

echo "=== PM2 Status ==="
pm2 status || echo "PM2 not running"
pm2 logs cms-api --lines 10 --nostream || echo "No PM2 logs"

echo ""
echo "=== Port Listening Check ==="
sudo netstat -tlnp 2>/dev/null | grep -E ':(80|443|3001)' || ss -tlnp | grep -E ':(80|443|3001)' || echo "No listening ports found"

echo ""
echo "=== Nginx Status ==="
if command -v nginx >/dev/null 2>&1; then
  sudo systemctl status nginx --no-pager -l || echo "Nginx service check failed"
  echo ""
  echo "=== Nginx Configuration ==="
  sudo nginx -t 2>&1 || echo "Nginx config test failed"
  echo ""
  echo "=== Active Nginx Sites ==="
  ls -la /etc/nginx/sites-enabled/ 2>/dev/null || echo "No sites-enabled directory"
  if [ -f /etc/nginx/sites-enabled/default ]; then
    echo "⚠️  Warning: default site is enabled (may conflict)"
    cat /etc/nginx/sites-enabled/default | head -20
  fi
  if [ -f /etc/nginx/sites-enabled/yusuke-kim ]; then
    echo "✅ yusuke-kim site configuration:"
    cat /etc/nginx/sites-enabled/yusuke-kim
  else
    echo "❌ yusuke-kim site not configured"
  fi
else
  echo "❌ Nginx is not installed"
fi

echo ""
echo "=== Static Export Files Check ==="
if [ -d "/var/www/yusuke-kim/out" ]; then
  echo "✅ /var/www/yusuke-kim/out directory exists"
  ls -la /var/www/yusuke-kim/out | head -10
else
  echo "❌ /var/www/yusuke-kim/out directory missing"
fi

echo ""
echo "=== Firewall Status (UFW) ==="
sudo ufw status verbose || echo "UFW not available"

echo ""
echo "=== Application Health Checks ==="
curl -f -s http://127.0.0.1:3001/health && echo "✅ Rust CMS API responding on port 3001" || echo "❌ Rust CMS API not responding on port 3001"
curl -f -s http://127.0.0.1:80/ | head -n 5 && echo "✅ Static Export site responding on port 80" || echo "❌ Static site not responding on port 80"

echo ""
echo "=== Network Interface ==="
ip addr show | grep -E 'inet ' | grep -v '127.0.0.1' || ifconfig | grep -E 'inet ' | grep -v '127.0.0.1' || echo "Network info not available"

echo ""
echo "=== GCP Firewall Check ==="
echo "⚠️  Note: GCP firewall rules must be checked in GCP Console"
echo "Required ports: 22 (SSH), 80 (HTTP), 443 (HTTPS)"
