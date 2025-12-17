# syntax=docker/dockerfile:1.4
FROM node:20-alpine AS development

WORKDIR /app

FROM development AS build

WORKDIR /app

# Build-time public env vars (baked into client bundles)
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
RUN npm ci

COPY . .
RUN npm run build

# Runtime for SSR
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# Install only production deps
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev

# Create non-root user early and set ownership
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only runtime artifacts and ensure ownership
# - .next (compiled build)
# - public static assets
# - next config if needed at runtime
COPY --from=build --chown=appuser:appgroup /app/.next ./.next
COPY --from=build --chown=appuser:appgroup /app/public ./public
COPY --from=build --chown=appuser:appgroup /app/next.config.* ./

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
	CMD wget -qO- http://localhost:3000/ || exit 1

# Start Next.js (expects a build already done)
CMD ["npm", "run", "start"]
