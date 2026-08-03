module.exports = {
  coverageDirectory: '../../coverage/libs/it-wallet',
  displayName: '@io-eudiw-app/it-wallet',
  moduleFileExtensions: ['ts', 'js', 'html', 'tsx', 'jsx'],
  moduleNameMapper: {
    '\\.svg$': '@nx/expo/plugins/jest/svg-mock'
  },
  modulePathIgnorePatterns: ['<rootDir>/out-tsc/'],
  preset: 'jest-expo',
  setupFilesAfterEnv: [
    '<rootDir>/src/test-setup.ts',
    require.resolve('react-native-gesture-handler/jestSetup.js'),
    require.resolve('@shopify/react-native-skia/jestSetup.js')
  ],
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
    'node_modules/(?!(@react-native|react-native|@react-navigation|@pagopa/io-app-design-system)|expo-modules-core|expo|@shopify/react-native-skia|/)'
  ]
};
