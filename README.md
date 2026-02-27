# Skeezers Games — Complete Redo

Fresh rebuild focused on reliability and easy scaling.

## Architecture
- Home page: `index.html`
- Player page: `/g/<slug>` via `g/index.html`
- Local catalog: `games.local.json`
- Local game files: `assets/allgames/<slug>/index.html`

## Add a game
1. Put game files in `assets/allgames/<slug>/`
2. Add catalog entry in `games.local.json`:

```json
{
  "slug": "my-game",
  "name": "My Game",
  "category": "Arcade",
  "description": "Self-hosted HTML5 game",
  "url": "/assets/allgames/my-game/index.html",
  "featured": true
}
```

## Deploy
Push to `main` and let Netlify auto-deploy.
