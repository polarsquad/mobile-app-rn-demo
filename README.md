# Mobile app CI/CD demo app built with ReactNative and TypeScript

**Monorepo for services and apps related to the RNTDemoApp**

## Get Started

### Install missing prerequisites if neccessary

1. Install Node.js and Yarn
2. Install [PM2](https://poopcode.com/node-js-app-pm2-process-manager/)
3. Install XCode from the AppStore
4. Install the [required tools](./clients/mobile-app/RNTDemoApp/README.md) for running the mobile app locally

### Running locally

1. Install dependencies

```
yarn
```

2. Start the backend service (GraphQL API)

```
(cd services/api && yarn run dev)
```

3. Start the React Native process and iOS and/or Android simulator in separate terminals [as instructed here](./clients/mobile-app/RNTDemoApp/README.md)

## Contents of this repository

- [Api service](./services/api)
- [Mobile client](./clients/mobile-app)
- [Infrastructure](./infrastructure)
