fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## Android

### android build_release

```sh
[bundle exec] fastlane android build_release
```

Build the App in release mode

### android bump_version

```sh
[bundle exec] fastlane android bump_version
```

Bump app version

### android alpha_playstore

```sh
[bundle exec] fastlane android alpha_playstore
```

Build the App in release mode and deploy in alpha track on the Google Play Store

### android download_apk

```sh
[bundle exec] fastlane android download_apk
```

Download universal APK file from Google Play

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
