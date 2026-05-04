/// <reference types="jest" />
/// <reference types="node" />
module.exports = {
  displayName: '@io-eudiw-app/it-wallet-133',
  preset: 'jest-expo',
  moduleFileExtensions: ['ts', 'js', 'html', 'tsx', 'jsx'],
  setupFilesAfterEnv: [
    '<rootDir>/src/test-setup.ts',
    '../../node_modules/react-native-gesture-handler/jestSetup.js',
    '../../node_modules/@shopify/react-native-skia/jestSetup.js'
  ],
  moduleNameMapper: {
    '\\.svg$': '@nx/expo/plugins/jest/svg-mock'
  },
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
    'node_modules/(?!(@react-native|react-native|@pagopa/io-app-design-system)|expo-modules-core|expo|@shopify/react-native-skia|/)'
  ],
  modulePathIgnorePatterns: ['<rootDir>/out-tsc/'],
  coverageDirectory: '../../coverage/libs/it-wallet'
};
