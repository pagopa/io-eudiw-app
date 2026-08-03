module.exports = {
  coverageDirectory: '../../coverage/apps/main-app',
  displayName: '@io-eudiw-app/main-app',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'html'],
  moduleNameMapper: {
    '\\.svg$': '@nx/expo/plugins/jest/svg-mock'
  },
  modulePathIgnorePatterns: ['<rootDir>/out-tsc/'],
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  transform: {
    '\\.[jt]sx?$': [
      'babel-jest',
      {
        configFile: __dirname + '/.babelrc.js'
      }
    ],
    '^.+\\.(bmp|gif|jpg|jpeg|mp4|png|psd|svg|webp|ttf|otf|m4v|mov|mp4|mpeg|mpg|webm|aac|aiff|caf|m4a|mp3|wav|html|pdf|obj)$':
      require.resolve('jest-expo/src/preset/assetFileTransformer.js')
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|standard-navigation|@reduxjs/toolkit|immer|redux-persist|@shopify/react-native-skia|@pagopa/io-app-design-system|react-native-linear-gradient|react-native-reanimated|react-native-gesture-handler))'
  ]
};
