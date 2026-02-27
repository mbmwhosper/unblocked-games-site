# PlayPortal (MonkeyGG2 HTML5 catalog mode)

This build now sources games from:
- `https://github.com/MonkeyGG2/monkeygg2.github.io`

Implementation:
- Loads `js/config.js` from the repo via jsDelivr CDN
- Uses all non-Flash entries from `json.games`
- Builds in-window play routes at `/g/<slug>`

## Notes
- Flash entries are filtered out automatically.
- If a specific game fails to embed, that is controlled by source/game frame policies.

## Deploy
- Repo: `mbmwhosper/unblocked-games-site`
- Netlify auto-deploys from `main`
