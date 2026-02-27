# PlayPortal

Static unblocked game hub with:
- Search
- Category filters
- Featured games
- Dedicated pages at `/g/<slug>`

## Local run

```bash
cd unblocked-games-site
python3 -m http.server 8080
# open http://localhost:8080
```

## Game catalog

Edit `games-data.js` entries:

```js
{ slug, name, category, featured, description, url }
```

## Deploy (recommended: Netlify + GitHub auto-publish)

1. Push this repo to GitHub (already done).
2. In Netlify: **Add new site → Import from Git**.
3. Select repo: `mbmwhosper/unblocked-games-site`.
4. Build command: *(blank)*
5. Publish directory: `.`
6. Deploy.

`_redirects` handles pretty game routes:
- `/g/* -> /g/index.html (200)`

## Domain setup with FreeDNS

If CNAME is blocked on your FreeDNS shared domain, use Netlify A records:
- `75.2.60.5`
- `99.83.190.102`

Then add custom domain in Netlify: `mbm.joe.dj`.
