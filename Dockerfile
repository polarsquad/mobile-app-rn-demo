ARG BUILD_VERSION
FROM common:$BUILD_VERSION
ARG BUILD_CONTEXT

ENV SERVICE=$BUILD_CONTEXT

WORKDIR /app

COPY package.json yarn.lock ./
RUN true
COPY ./services/$BUILD_CONTEXT/package.json services/$BUILD_CONTEXT/

RUN yarn install --ignore-scripts --frozen-lockfile --non-interactive \
  && yarn cache clean

COPY ./services/$BUILD_CONTEXT services/$BUILD_CONTEXT/
RUN yarn build:$BUILD_CONTEXT

ENV NODE_ENV production

CMD yarn start:${SERVICE}
