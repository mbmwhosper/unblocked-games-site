# PlayPortal

JSON-driven unblocked game hub.

## Data sources (GitHub)

This build currently aggregates game metadata from:

- `https://raw.githubusercontent.com/thedogecraft/lunaar.org/main/public/json/games.json`
- `https://raw.githubusercontent.com/swarmintelli/Unblocked-Games-CDN/main/games.json`

Merge behavior:
- Adds games that are missing from the existing catalog
- De-duplicates by normalized game name
- If duplicate exists in multiple sources, keeps the higher-priority source entry (used as "newer/better" preference)

## Features

- Search
- Category filters
- Featured games
- Dedicated pages at `/g/<slug>`
- Window-only game player mode

## Local run

```bash
cd unblocked-games-site
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy

- Connected GitHub repo: `mbmwhosper/unblocked-games-site`
- Netlify auto-deploys from `main`
