# Skeezers Games — Full Local Merge Mode

This build is now merged with MonkeyGG2 HTML5 game files locally.

## Current state
- Imported HTML5 games: **115**
- Local assets path: `assets/allgames/`
- Catalog path: `games.local.json`
- Approx game asset size: **~3.4 GB**

## Re-run import

```bash
node tools/import-monkey-local.mjs
```

## Why not push all game files to GitHub?
Large binary files and repo size limits make GitHub/Netlify unreliable for this full library.

## Recommended deploy (VPS)

1. Prepare a Linux VPS with Nginx.
2. One-command manual deploy:

```bash
cd /home/c/.openclaw/workspace/unblocked-games-site
VPS_USER=ubuntu VPS_HOST=YOUR_IP VPS_PATH=/var/www/skeezers ./deploy-vps.sh
```

3. Nginx site config:

```nginx
server {
  listen 80;
  server_name skeezers.org www.skeezers.org;
  root /var/www/skeezers;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /g/ {
    try_files $uri /g/index.html;
  }
}
```

4. Enable HTTPS with Certbot.

## Auto-deploy on every push (near real-time)

A GitHub Actions workflow is included at:
- `.github/workflows/deploy-vps.yml`

Set these GitHub repo secrets:
- `VPS_HOST` (e.g. `1.2.3.4`)
- `VPS_USER` (e.g. `ubuntu`)
- `VPS_PATH` (e.g. `/var/www/skeezers`)
- `VPS_SSH_KEY` (private deploy key content)
- `VPS_RELOAD_CMD` (optional, e.g. `sudo systemctl reload nginx`)

After secrets are set, every push to `main` auto-syncs to VPS.

## Notes
- In-window reliability is best when assets are served from your own domain.
- Some games may still need per-title fixes depending on their original packaging.
