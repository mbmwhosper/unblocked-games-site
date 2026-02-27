# PlayPortal

JSON-driven unblocked game hub.

## Data source

This build reads game metadata from:

`https://raw.githubusercontent.com/swarmintelli/Unblocked-Games-CDN/main/games.json`

It parses:
- `game_name`
- `game_image_icon`
- `iframe` (extracts iframe `src`)
- optional `category`, `description`, `slug`

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
