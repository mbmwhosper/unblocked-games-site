# PlayPortal (Unblocked Game Hub Scaffold)

A lightweight static site that lists browser games and launches them in an embedded player.

## Run locally

```bash
cd unblocked-games-site
python3 -m http.server 8080
# open http://localhost:8080
```

## Customize game list

Edit `script.js` and update the `games` array:

```js
{
  name: "Game Name",
  category: "Arcade",
  description: "One-line description",
  url: "https://example.com/game"
}
```

## Deploy options

- GitHub Pages / Netlify / Vercel (static hosting)
- Your own VPS/Nginx host

## FreeDNS (afraid.org) setup

1. Create/login at https://freedns.afraid.org/
2. Add a subdomain in **Subdomains**.
3. Choose one:
   - **A record** → point to your server IP (best if self-hosting).
   - **CNAME** → point to a hosted site domain.
   - **URL redirect** → forwards users, but keeps fewer DNS controls.
4. If using dynamic IP, set up **Dynamic DNS** update URL from your FreeDNS panel.

### Example dynamic updater (Linux cron)

```bash
curl -fsS "https://freedns.afraid.org/dynamic/update.php?<YOUR_TOKEN>"
```

Add to crontab (every 10 min):

```cron
*/10 * * * * /usr/bin/curl -fsS "https://freedns.afraid.org/dynamic/update.php?<YOUR_TOKEN>" >/dev/null 2>&1
```

## Notes

- Some game hosts block iframe embedding via security headers. Use "Open in New Tab" for those.
- Only include games/content you are authorized to host or link.
