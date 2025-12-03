module.exports = {
  preset: 'react-native',
  transform: {
    '^.+\\.(js|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    "node_modules/(?!(react-native"
      + "|@react-native"
      + "|@react-navigation"
      + "|@react-native-community"
      + "|immer"
      + "|@reduxjs/toolkit"
      + ")/)"
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
