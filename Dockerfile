# Multi-stage Nuxt production build.
#
# Stage 1 — build: pulls dev deps, builds .output.
# Stage 2 — runtime: minimal image running the compiled Nitro server + one-shot
#                    migration/seed scripts via tsx.

# ── Build stage ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Install deps first — this layer is cached until package*.json changes.
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build.
COPY . .
ENV NUXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Runtime stage ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV NUXT_TELEMETRY_DISABLED=1
ENV HOST=0.0.0.0
ENV PORT=3000

# Compiled Nitro output.
COPY --from=builder /app/.output ./.output
# Migrations SQL + seed script — used at boot to prep the DB.
COPY --from=builder /app/server/database ./server/database
COPY --from=builder /app/package.json ./package.json

# Small runtime deps for the seed / migration scripts (drizzle + tsx).
RUN npm install --omit=dev --no-audit --no-fund tsx postgres dotenv drizzle-orm

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
