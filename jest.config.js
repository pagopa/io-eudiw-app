module.exports = {
  preset: 'react-native',
  transform: {
    '^.+\\.(js|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    "node_modules/(?!(react-native"
      + "|@react-native"
      + "|react-native-linear-gradient"
      + "|react-native-reanimated"
      + "|react-native-qrcode-svg"
      + "|@react-navigation"
      + "|@react-native-community"
      + "|immer"
      + "|@reduxjs/toolkit"
      + "|@pagopa/io-app-design-system"
      + "|@shopify/react-native-skia"
      + ")/)"
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  setupFiles: [
    "./jestSetup.js",
    "./node_modules/react-native-gesture-handler/jestSetup.js",
    './node_modules/@shopify/react-native-skia/jestSetup.js'
  ]
};
