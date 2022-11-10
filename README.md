# Mobile app CI/CD demo app built with ReactNative and TypeScript

**Monorepo for services and apps related to the RNTDemoApp**

## Get Started

### Install missing prerequisites if neccessary

1. Install Node.js and Yarn
2. Install XCode from the AppStore (for iOS)
3. Install the [required tools](./clients/mobile-app/RNTDemoApp/README.md) for running the mobile app locally

### Running locally

1. Install dependencies

```
yarn
```

2. Start the backend service (GraphQL API)

```
(cd services/api && yarn run dev)
```

3. Start the background worker service (NodeJS app)

```
(cd services/background-worker && yarn run dev)
```

4. Start the React Native process and iOS and/or Android simulator in separate terminals [as instructed here](./clients/mobile-app/RNTDemoApp/README.md)

### Running from Docker Compose

1. Build containers and spin them up

```
env BUILD_VERSION=$(git rev-parse --short HEAD) docker-compose up --build
```

2. Ramp down

```
docker-compose down --remove-orphans
```

## Contents of this repository

- [Api service](./services/api)
- [Mobile client](./clients/mobile-app)
- [Infrastructure](./infrastructure)

### Known issues

#### MacOS M1 

- Building with Docker Compose: [disable buildkit](https://github.com/docker/compose/issues/8449)

#### Android simulator

- The `API_URL` configured in `clients/mobile-app/RNTDemoApp/.env` needs to point to your local IP address like `192.168.x.x` when testing through Docker Compose, with `localhost` the app fails to connect to the GraphQL endpoint
