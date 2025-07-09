# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.18.1

# base stage
FROM node:${NODE_VERSION}-alpine AS base

WORKDIR /app

# build stage
FROM base AS build

COPY package*.json ./

# install all dependencies
RUN echo "Installing" && npm ci --quiet

COPY . .

RUN npm run build --quiet

# release stage
FROM base AS release

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

EXPOSE 3000

# run application
CMD ["node", "dist/main.js"]
