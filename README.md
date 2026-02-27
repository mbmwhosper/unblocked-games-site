# Skeezers Games — Complete Redo

Fresh rebuild focused on reliability and easy scaling.

## Architecture
- Home page: `index.html`
- Player page: `/g/<slug>` via `g/index.html`
- Catalog: `games.local.json`
- Game files: `assets/allgames/<slug>/...`

## Add a game
1. Put game files in `assets/allgames/<slug>/`
2. Add catalog entry in `games.local.json`.

## Cheapest scale setup (Netlify + Cloudflare R2)

### 1) Create R2 bucket
- Cloudflare Dashboard → R2 → Create bucket
- Name example: `skeezers-games`

### 2) Bind custom domain to bucket
- R2 bucket → Settings → Custom Domains
- Add: `games.skeezers.org`

### 3) DNS in IONOS
- Add `CNAME`:
  - Host: `games`
  - Value: target shown by Cloudflare for your R2 custom domain

### 4) Upload assets to R2
Use AWS CLI (S3-compatible):

```bash
aws configure --profile r2
# Access key = R2 API token key
# Secret = R2 API token secret
# region = auto

aws s3 sync ./assets/allgames s3://skeezers-games/assets/allgames \
  --endpoint-url https://<ACCOUNT_ID>.r2.cloudflarestorage.com \
  --profile r2
```

### 5) Rewrite catalog URLs to R2 domain

```bash
node tools/rewrite-catalog-for-r2.mjs https://games.skeezers.org
```

### 6) Deploy frontend (Netlify)
Commit and push. Netlify serves app; game files stream from R2.

## Notes
- App accepts both local (`/assets/...`) and remote (`https://...`) game URLs.
- This avoids GitHub large-file limits while keeping frontend updates fast.
