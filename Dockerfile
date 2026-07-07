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

# Small runtime deps for the seed / migration scripts (drizzle + tsx).
# Use an isolated, pinned package.json — NOT the app's — so npm resolves only
# these four packages. The app package.json pulls drizzle-kit's deprecated
# @esbuild-kit chain (esbuild 0.18.20) which collides with tsx's newer esbuild
# during postinstall ("Expected 0.18.20 but got ..."). Isolating avoids it.
COPY docker/runtime-package.json ./package.json
RUN npm install --omit=dev --no-audit --no-fund

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
