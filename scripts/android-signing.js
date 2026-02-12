// withAndroidSigning.js
const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withAndroidSigning(config) {
  return withAppBuildGradle(config, config => {
    const buildGradle = config.modResults.contents;

    // We inject this specific block into the existing signingConfigs
    const signingConfigBlock = `
        release {
            if (System.getenv('IO_APP_RELEASE_STORE_FILE')) {
                storeFile file(System.getenv('IO_APP_RELEASE_STORE_FILE'))
                storePassword System.getenv('IO_APP_RELEASE_STORE_PASSWORD')
                keyAlias System.getenv('IO_APP_RELEASE_KEY_ALIAS')
                keyPassword System.getenv('IO_APP_RELEASE_KEY_PASSWORD')
            }
        }`;

    // Regex to find 'signingConfigs {' and inject our block right after it
    const pattern = /signingConfigs\s*\{/;

    if (!buildGradle.match(pattern)) {
      // Fallback: If for some reason signingConfigs is missing, we append the whole block
      console.warn('Could not find signingConfigs block in build.gradle');
    } else {
      // Inject the release config inside the existing signingConfigs block
      config.modResults.contents = buildGradle.replace(
        pattern,
        `signingConfigs {${signingConfigBlock}`
      );
    }

    // We look for buildTypes -> release and ensure it uses signingConfigs.release
    const releaseBuildTypePattern = /buildTypes\s*\{\s*release\s*\{/;

    if (config.modResults.contents.match(releaseBuildTypePattern)) {
      config.modResults.contents = config.modResults.contents.replace(
        releaseBuildTypePattern,
        `buildTypes {\n        release {\n            signingConfig signingConfigs.release`
      );
    }

    return config;
  });
};
