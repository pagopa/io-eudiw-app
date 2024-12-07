// eslint-disable-next-line functional/immutable-data
module.exports = {
  project: {
    ios: {},
    android: {}
  },
  dependencies: {
    '@pagopa/react-native-cie': {
      platforms: {
        android: null // disable Android platform, other platforms will still autolink if provided
      }
    }
  },
  assets: ['./assets/fonts']
};
