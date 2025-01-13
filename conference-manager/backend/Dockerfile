###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:18-alpine As development

###################
# BUILD FOR PRODUCTION
###################

FROM development As build

WORKDIR /usr/src/app

COPY --chown=node:node package.json ./
COPY --chown=node:node yarn.lock ./

RUN yarn install --frozen-lockfile

# In order to run `yarn run build` we need access to the Nest CLI which is a dev dependency.
# In the previous development stage we ran `npm ci` which installed all dependencies, so we
# can copy over the node_modules directory from the development image
COPY --chown=node:node . .

# Run the build command which creates the production bundle
RUN yarn run build

# Running `npm ci` removes the existing node_modules directory and passing in --only=production
# ensures that only the production dependencies are installed. This ensures that the
# node_modules directory is as optimized as possible
# RUN npm ci --only=production && npm cache clean --force
RUN rm -rf node_modules && yarn install -only=production --frozen-lockfile && yarn cache clean

USER node

###################
# PRODUCTION
###################

FROM node:18-alpine As production

WORKDIR /usr/src/app

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist .

# Expose the port the app runs on
EXPOSE 5002

# Start the server using the production build
CMD [ "node", "main.js" ]
