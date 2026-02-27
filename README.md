# PlayPortal (Self-hosted mode)

This site is now configured for **self-hosted games only**.

## How to add games

1. Put game files in:
- `assets/allgames/<slug>/...`

2. Add an entry to:
- `games.local.json`

Example entry:

```json
{
  "slug": "my-game",
  "name": "My Game",
  "category": "Arcade",
  "description": "My self-hosted game build.",
  "thumbnail": "/assets/allgames/my-game/thumb.png",
  "url": "/assets/allgames/my-game/index.html",
  "featured": true
}
```

## Local run

```bash
cd unblocked-games-site
python3 -m http.server 8080
```

## Deploy

- Repo: `mbmwhosper/unblocked-games-site`
- Netlify auto-deploys from `main`
