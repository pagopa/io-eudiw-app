<p align="center">
  <img src="assets/repository/app-icon.png" width="100" style="display: block" /></br>
  <h3 align="center">io-eudiw-app</h3>
</p>

# Getting started

The following sections provide instructions to build and run the app for development purposes.

## Prerequisites

### NodeJS and Ruby

To run the project you need to install the correct version of NodeJS and Ruby.
We recommend the use of a virtual environment of your choice. For ease of use, this guide adopts [nodenv](https://github.com/nodenv/nodenv) for NodeJS, [rbenv](https://github.com/rbenv/rbenv) for Ruby.

The node version used in this project is stored in [.node-version](.node-version),
while the version of Ruby is stored in [.ruby-version](.ruby-version).

### React Native

Follow the [official tutorial](https://reactnative.dev/docs/environment-setup?guide=native) for installing the `React Native CLI` for your operating system.

If you have a macOS system, you can follow both the tutorial for iOS and for Android. If you have a Linux or Windows system, you need only to install the development environment for Android.

## Build the app

In order to build the app, we use [yarn](https://yarnpkg.com/) for managing javascript dependencies.
As stated [previously](#nodejs-and-ruby), we also use `nodenv` and `rbenv` for managing the environment:

```bash
# Clone the repository
$ git clone https://github.com/pagopa/io-eudiw-app

# CD into the repository
$ cd io-eudiw-app

# Install NodeJS with nodenv, the returned version should match the one in the .node-version file
$ nodenv install && nodenv version

# Install Ruby with rbenv, the returned version should match the one in the .ruby-version file
$ rbenv install && rbenv version

# Install yarn and rehash to install shims
$ npm install -g yarn && nodenv rehash

# Install bundle
$ gem install bundle

# Install the required Gems from the Gemfile
# Run this only during the first setup and when Gems dependencies change
$ bundle install

# Install dependencies
# Run this only during the first setup and when JS dependencies change
$ yarn install

# Install podfiles when targeting iOS (ignore this step for Android)
# Run this only during the first setup and when Pods dependencies change
$ cd iOS && bundle exec pod install && cd ..
```

## Environment variables

### Production

You can target the production server by copying the included `.env.production` file to `.env`:

```bash
$ cp .env.production .env
```

> [!NOTE]
> The sample configuration sets the app to interface with our test environment, on which we work continuously; therefore, it may occur that some features are not always available or fully working. Check the comments in the file for more informations about environment variables.

### development

You can target the development server by copying the included `.env.local` file to `.env`:

```bash
$ cp .env.local .env
```

## Run the app

### Android Emulator

An Android Emulator must be [created and launched manually](https://developer.android.com/studio/run/managing-avds).

Then, from your command line, run these commands:

```bash
# Perform the port forwarding
$ adb reverse tcp:8081 tcp:8081;adb reverse tcp:3000 tcp:3000;adb reverse tcp:9090 tcp:9090

# Run Android build
$ yarn run-android
```

However the Android Emulator is not fully supported because it doesn't support the hardware-backed keystore.

### iOS Simulator

```bash
# Run iOS build
$ yarn run-ios
```

### Physical devices

The React Native documentation provides a [useful guide](https://reactnative.dev/docs/running-on-device) for running projects on physical devices.

> [!IMPORTANT]  
> For building the app on an iOS physical device, a few additional steps are necessary:
>
> - Navigate to `Build Phases` in Xcode and expand `Bundle React Native code and images`. Update the `NODE_BINARY` variable with the path to your Node.js environment. You can find the correct path by running `which node` in a terminal from the app's root directory;
> - If you're not part of the PagoPA S.p.A. organization then you must change the `Bundle Identifier` to something unique. This adjustment can be made in the `Signing (Debug)`
>   section of Xcode;

# Architecture

## Main technologies used

- [`TypeScript`](https://www.typescriptlang.org/)
- [`React Native`](https://facebook.github.io/react-native)
- [`Redux`](http://redux.js.org/)
- [`Redux Saga`](https://redux-saga.js.org/)

## Wallet libraries ecosystem

- [`io-react-native-wallet`](https://github.com/pagopa/io-react-native-wallet)
- [`io-react-native-cbor`](https://github.com/pagopa/io-react-native-cbor)

## Design System

- [`io-app-design-system`](https://github.com/pagopa/io-app-design-system/)
