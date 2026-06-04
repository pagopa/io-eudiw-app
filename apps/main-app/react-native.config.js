module.exports = {
  dependencies: {
    // `@react-native-community/art` is a deprecated transitive dependency of
    // `react-native-barcode-builder`. The library is patched to render barcodes
    // with `react-native-svg` instead of ART (see
    // patches/react-native-barcode-builder__svg.patch), so ART's native module
    // is unused. ART 1.2.0 also fails to compile against React Native 0.81+
    // (missing `com.facebook.react.common.ArrayUtils`, unimplemented
    // `ViewManager.prepareToRecycleView`). Excluding it from autolinking keeps
    // it out of the native build.
    '@react-native-community/art': {
      platforms: {
        android: null,
        ios: null
      }
    }
  }
};
