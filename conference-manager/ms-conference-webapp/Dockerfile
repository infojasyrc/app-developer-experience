# syntax=docker/dockerfile:1

# ─────────────────────────────────────────────
# Stage 1 — development
#   Bare node:20-alpine base with WORKDIR set.
#   Built by `make build-dev` (--target development)
#   and used as the volume-mounted dev container by
#   `make launch` and `make install-dependencies`.
#   Node modules are never baked in — they live in a
#   named Docker volume managed by the Makefile.
# ─────────────────────────────────────────────
FROM node:20-alpine AS development

WORKDIR /app

# ─────────────────────────────────────────────
# Stage 2 — build
#   Inherits the dev base, installs all deps,
#   compiles the Next.js app, and produces
#   .next/standalone via output:standalone.
# ─────────────────────────────────────────────
FROM development AS build

WORKDIR /app

# Build-time public env vars (baked into client bundles at next build)
ARG NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH

ARG NEXT_PUBLIC_VERSION
ENV NEXT_PUBLIC_VERSION=$NEXT_PUBLIC_VERSION

ARG NEXT_PUBLIC_API_KEY
ENV NEXT_PUBLIC_API_KEY=$NEXT_PUBLIC_API_KEY
ARG NEXT_PUBLIC_AUTH_DOMAIN
ENV NEXT_PUBLIC_AUTH_DOMAIN=$NEXT_PUBLIC_AUTH_DOMAIN
ARG NEXT_PUBLIC_DATABASE_URL
ENV NEXT_PUBLIC_DATABASE_URL=$NEXT_PUBLIC_DATABASE_URL
ARG NEXT_PUBLIC_PROJECT_ID
ENV NEXT_PUBLIC_PROJECT_ID=$NEXT_PUBLIC_PROJECT_ID
ARG NEXT_PUBLIC_STORAGE_BUCKET
ENV NEXT_PUBLIC_STORAGE_BUCKET=$NEXT_PUBLIC_STORAGE_BUCKET
ARG NEXT_PUBLIC_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_MESSAGING_SENDER_ID=$NEXT_PUBLIC_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_MEASUREMENT_ID
ENV NEXT_PUBLIC_MEASUREMENT_ID=$NEXT_PUBLIC_MEASUREMENT_ID

COPY package*.json ./

# --mount=type=cache keeps the npm download cache across builds.
# After the first build, npm ci only re-downloads changed packages.
# Alpine uses musl libc: remove the glibc SWC and libvips binaries
# (@next/swc-linux-x64-gnu, @img/sharp-libvips-linux-x64) — they are
# never loaded on Alpine and each weighs ~124MB / ~16MB.
RUN --mount=type=cache,target=/root/.npm \
    npm ci && \
    rm -rf node_modules/@next/swc-linux-x64-gnu \
           node_modules/@img/sharp-libvips-linux-x64

COPY . .

RUN npm run build

# ─────────────────────────────────────────────
# Stage 3 — runtime
#   Copies only the Next.js standalone output.
#   No npm install, no full next package, no SWC.
#   Node File Tracing (NFT) ensures only the
#   modules actually required at runtime are present.
# ─────────────────────────────────────────────
FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production \
    # Bind to all interfaces inside the container
    HOSTNAME=0.0.0.0 \
    PORT=3000

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# 1. Standalone server + NFT-traced node_modules (~10-30 packages vs 66)
COPY --from=build --chown=appuser:appgroup /app/.next/standalone ./

# 2. Static client assets (.next/static is not bundled into standalone)
COPY --from=build --chown=appuser:appgroup /app/.next/static ./.next/static

# 3. Public assets served by the Node server directly
COPY --from=build --chown=appuser:appgroup /app/public ./public

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
	CMD wget -qO- http://localhost:3000/ || exit 1

# node server.js — no npm, no next CLI overhead
CMD ["node", "server.js"]
