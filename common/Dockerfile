ARG BUILD_VERSION
FROM node:16.17.0-bullseye-slim

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY common/package.json common/yarn.lock common/

RUN yarn install --ignore-scripts --frozen-lockfile --non-interactive \
  && yarn cache clean

COPY common common

RUN yarn run build:common

# Don't run anything in this image
CMD true
