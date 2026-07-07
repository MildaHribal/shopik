# Deploy — tynkybordel.shop

Production stack: Nuxt 4 + Postgres 17 + Caddy (auto Let's Encrypt), all in Docker Compose.

## Prerequisites on the VPS

1. Ubuntu 22.04+ / Debian 12+ / anything with a modern kernel
2. Ports **80** and **443** open to the internet
3. **DNS pointing to the VPS**:
   - In Cloudflare add:
     - `A  @   <VPS_IPv4>` (Proxy: **on** — orange cloud OK)
     - `A  www <VPS_IPv4>` (Proxy: on)
   - SSL/TLS mode in Cloudflare → **Full (strict)**

## First-time VPS setup

```bash
# 1. Docker + compose plugin
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# 2. Clone the project
git clone <your-repo-url> shopik
cd shopik

# 3. Fill in production env
cp .env.production.example .env.production
nano .env.production          # set POSTGRES_PASSWORD, BETTER_AUTH_SECRET,
                              # Google OAuth, SMTP, Packeta keys…

# 4. Build & start
docker compose -f docker-compose.prod.yml up -d --build

# 5. Apply migrations (idempotent — safe to re-run on every deploy)
docker compose -f docker-compose.prod.yml exec app npx tsx server/database/migrate.ts

# 6. Seed initial products (only the first time, or after wiping DB)
docker compose -f docker-compose.prod.yml exec app npm run seed
```

Caddy will request a Let's Encrypt cert on first request to `https://tynkybordel.shop`. You'll see the cert issuance in `docker compose logs caddy`.

## Google OAuth

After DNS + HTTPS are live, edit the Google Cloud OAuth client:
- Authorized JavaScript origins: `https://tynkybordel.shop`
- Authorized redirect URIs: `https://tynkybordel.shop/api/auth/callback/google`

## Deploy updates

```bash
cd shopik
git pull
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec app npx tsx server/database/migrate.ts
```

Zero downtime is not configured — compose will restart the app container in ~5s during `up -d --build`. For a small artisan shop that's fine.

## Backups

The DB lives in the `pgdata` docker volume. Uploaded images live in `uploads`. Nightly backup script:

```bash
# Dump DB
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U shopik shopik | gzip > backup-$(date +%Y%m%d).sql.gz

# Rsync uploads
docker run --rm -v shopik_uploads:/data -v $(pwd)/backup:/backup alpine \
  tar czf /backup/uploads-$(date +%Y%m%d).tar.gz -C /data .
```

Put those two lines in a nightly cron.

## Common issues

- **Caddy fails to get cert** → Cloudflare "orange cloud" must be on and SSL mode "Full (strict)". Or temporarily set to "Full" if Caddy hasn't got a cert yet — LE HTTP-01 challenge needs to reach port 80.
- **Emails not going out** → Check `docker compose logs app | grep mail`. Seznam requires SMTP_SECURE=true and port 465. Try authenticating manually first.
- **Uploaded images disappear after rebuild** → confirm the `uploads` named volume in `docker-compose.prod.yml` mounts to `/app/.output/public/uploads`.

## Local dev (unchanged)

```bash
docker compose -f docker/docker-compose.yml up -d   # postgres only on :5435
npm run dev                                          # nuxt on :3000
```
