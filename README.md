# PlayPortal (Self-hosted local mode)

I switched the site to run fully from local game files so in-window play is reliable.

## What was set up

- Local catalog file: `games.local.json`
- 10 scaffolded game slots:
  - `/assets/allgames/game-01/` ... `/assets/allgames/game-10/`
- Each slot has a placeholder `index.html`

## To add a real game

1. Replace placeholder files inside a slot folder with the real HTML5 game build.
2. Keep an entry in `games.local.json` like:

```json
{
  "slug": "game-01",
  "name": "My Game",
  "category": "Arcade",
  "description": "My self-hosted game",
  "thumbnail": "/assets/allgames/game-01/thumb.png",
  "url": "/assets/allgames/game-01/index.html",
  "featured": true
}
```

## Deploy

Push to `main`; Netlify auto-deploys.
