###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:20-alpine AS development

###################
# BUILD FOR PRODUCTION
###################

FROM development AS build

WORKDIR /usr/src/app

COPY --chown=node:node package.json ./
COPY --chown=node:node yarn.lock ./

RUN yarn install --frozen-lockfile

COPY --chown=node:node . .

RUN yarn run build

RUN rm -rf node_modules && yarn install --production --frozen-lockfile && yarn cache clean

USER node

###################
# PRODUCTION
###################

FROM node:20-alpine AS production

WORKDIR /usr/src/app

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist .

# Expose the port the app runs on
EXPOSE 3000

# Start the server using the production build
CMD [ "node", "main.js" ]
