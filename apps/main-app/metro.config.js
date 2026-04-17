const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer/expo')
  };
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter(ext => ext !== 'svg'),
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === 'crypto') {
        return context.resolveRequest(
          context,
          'react-native-quick-crypto',
          platform
        );
      }
      return context.resolveRequest(context, moduleName, platform);
    },
    sourceExts: [...resolver.sourceExts, 'svg']
  };

  // required by @pagopa/react-native-nodelibs
  config.resolver.extraNodeModules = {
    ...config.resolver.extraNodeModules,
    ...require('@pagopa/react-native-nodelibs')
  };
  return config;
})();
