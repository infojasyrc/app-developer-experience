ARG NODE_VERSION=20.18.1

# development stage (no node_modules baked in)
FROM node:${NODE_VERSION}-alpine AS development

WORKDIR /app

# build stage
FROM development AS build

COPY package*.json ./

# install all dependencies
RUN echo "Installing" && npm ci --quiet

COPY . .

RUN npm run build --quiet

# release stage
FROM development AS release

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

EXPOSE 3000

# run application
CMD ["node", "dist/main.js"]
