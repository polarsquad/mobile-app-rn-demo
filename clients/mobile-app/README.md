# Installing the required software to develop the app from M1 Mac

The initial React Native & Typescript project was bootstrapped [following the instructions from the official documentation](https://reactnative.dev/docs/environment-setup).

It did not cover how to configure the Android emulator for M1 Mac (ARM) however.

## Configuring Android Emulator (ARM)

- Android SDK Build-Tools: `30.0.2`
- Create a [virtual device (AVD)](https://developer.android.com/studio/run/managing-avds.html) via Android Studio's Device Manager for this specific version
    * Open the project in Android Studio: `clients/mobile-app/RNTDemoApp/android`
    * Create new virtual device
        * AVD name: `Pixel_3a_API_30_arm64-v8a`
        * System image: `R 30 - arm64-v8a`
