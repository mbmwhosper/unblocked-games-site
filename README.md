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
2. Copy site files:

```bash
rsync -avz --progress /home/c/.openclaw/workspace/unblocked-games-site/ user@YOUR_VPS:/var/www/skeezers/
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

## Notes
- In-window reliability is best when assets are served from your own domain.
- Some games may still need per-title fixes depending on their original packaging.
