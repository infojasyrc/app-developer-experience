FROM node:20-alpine AS development

WORKDIR /app

FROM development AS build

ARG REACT_APP_BASE_PATH
ENV REACT_APP_BASE_PATH=$REACT_APP_BASE_PATH

ARG REACT_APP_VERSION
ENV REACT_APP_VERSION=$REACT_APP_VERSION

ARG REACT_APP_API_KEY
ENV REACT_APP_API_KEY=$REACT_APP_API_KEY

ARG REACT_APP_AUTH_DOMAIN
ENV REACT_APP_AUTH_DOMAIN=$REACT_APP_AUTH_DOMAIN

ARG REACT_APP_DATABASE_URL
ENV REACT_APP_DATABASE_URL=$REACT_APP_DATABASE_URL

ARG REACT_APP_PROJECT_ID
ENV REACT_APP_PROJECT_ID=$REACT_APP_PROJECT_ID

ARG REACT_APP_STORAGE_BUCKET
ENV REACT_APP_STORAGE_BUCKET=$REACT_APP_STORAGE_BUCKET

ARG REACT_APP_MESSAGING_SENDER_ID
ENV REACT_APP_MESSAGING_SENDER_ID=$REACT_APP_MESSAGING_SENDER_ID

ARG REACT_APP_FIREBASE_APP_ID
ENV REACT_APP_FIREBASE_APP_ID=$REACT_APP_FIREBASE_APP_ID

ARG REACT_APP_MEASUREMENT_ID
ENV REACT_APP_MEASUREMENT_ID=$REACT_APP_MEASUREMENT_ID

RUN apk add --no-cache python3=3.9.5-r1 make=4.3-r0 g++=10.2.1_pre1-r3
RUN ln -sf python3 /usr/bin/python || true

# RUN apk add --no-cache python3 make g++
#RUN ln -sf python3 /usr/bin/python || true

# Set environment variable to specify the Python interpreter location
ENV PYTHON=/usr/bin/python3

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build:ci

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

# Create a non-root user and switch to it
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

USER appuser

EXPOSE 80

# Add a healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
