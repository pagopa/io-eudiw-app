/* This is needed for react-native-dotenv. When using with babel-loader with caching enabled you will run into issues where environment changes won’t be picked up.
 * This is due to the fact that babel-loader computes a cacheIdentifier that does not take the .env files into account.
 * This can be removed once every dependency updates babel-loader to 8.3.0 or higher.
 */

module.exports = {
  presets: ['babel-preset-expo'],
  plugins: ['react-native-reanimated/plugin']
};
