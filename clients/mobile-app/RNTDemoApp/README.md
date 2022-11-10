# React Native & Typescript demo app

## Get started

```sh
# Install dependencies
yarn

# Check your environment (make sure you fix all errors)
yarn run react-native doctor

# Run main react-native process
yarn run start --reset-cache
```

_Then, continue in a different shell with the iOS or Android-specific instructions_

## Environment configuration

The `API_URL` is passed to the mobile app via environment variable. For local development, this can be configured using a file called `.env` in the app's root (this directory). By design, this file is not included in the version control so you'll have to create it yourself.

```sh
cp env-template .env
```

### For iOS

Ensure Xcode is installed.

```sh
# Install cocoapods dependencies
(cd ios && pod install)

# Run iOS Simulator
yarn run ios
```

### For Android

Ensure a virtual device has been set up in Android Studio.

```sh
# Run Android emulator
yarn run android
```

## Known issues

- `react-native-dotenv` caches values, use `--reset-cache` flag when starting main react-native process
