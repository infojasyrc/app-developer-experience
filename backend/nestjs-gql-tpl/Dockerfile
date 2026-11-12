# syntax=docker/dockerfile:1

ARG NODE_VERSION=26.13

# development stage (Debian slim, no node_modules baked in)
FROM node:${NODE_VERSION}-slim AS development

WORKDIR /app

# build stage
FROM development AS build

COPY package*.json ./

# install all dependencies
RUN echo "Installing" && npm ci --quiet

COPY . .

RUN npm run build --quiet

# release stage: alpine only, production dependencies only
FROM node:${NODE_VERSION}-alpine AS release

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev --ignore-scripts --quiet && npm cache clean --force

COPY --from=build /app/dist ./dist

USER node

EXPOSE 3000

# run application
CMD ["node", "dist/main.js"]
