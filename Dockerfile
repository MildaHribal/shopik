# ── Stage 1: Install dependencies ──
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# ── Stage 2: Build ──
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NUXT_TELEMETRY_DISABLED=1

RUN npm run build

# ── Stage 3: Production runner ──
FROM node:20-alpine AS runner

RUN apk add --no-cache msmtp ca-certificates \
    && ln -sf /usr/bin/msmtp /usr/sbin/sendmail

WORKDIR /app

ENV NODE_ENV=production
ENV NUXT_TELEMETRY_DISABLED=1
ENV HOST=0.0.0.0
ENV PORT=3000

# Copy only what's needed to run
# Nuxt production builds into .output
COPY --from=builder /app/.output ./.output

EXPOSE 3000

# Run the Nitro server
CMD ["node", ".output/server/index.mjs"]
