fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## iOS

### ios certificates

```sh
[bundle exec] fastlane ios certificates
```

Fetch certificates and provisioning profiles

### ios test

```sh
[bundle exec] fastlane ios test
```

Runs all the tests

### ios refresh_profiles

```sh
[bundle exec] fastlane ios refresh_profiles
```



### ios test_build

```sh
[bundle exec] fastlane ios test_build
```



### ios do_testflight_build

```sh
[bundle exec] fastlane ios do_testflight_build
```



### ios beta_testflight

```sh
[bundle exec] fastlane ios beta_testflight
```

Submit a new Beta Build to TestFlight

### ios beta_circleci_testflight

```sh
[bundle exec] fastlane ios beta_circleci_testflight
```

Submit a new Beta Build to TestFlight, using CircleCI

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
