FROM node:18.11-alpine

EXPOSE 3000

WORKDIR /opt/msbase/app

COPY . .

# Everything in a single RUN, to avoid unecessary docker layers.
RUN echo "Starting" \
     && npm install \
     && npm run build \
     && npm prune --production \
     && rm -f .npmrc 

# Silent start because we want to have our log format as the first log
CMD ["npm", "run", "start:prod"]
