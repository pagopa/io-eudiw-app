// withAndroidSigning.js
const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withAndroidSigning(config) {
  return withAppBuildGradle(config, config => {
    let contents = config.modResults.contents;

    // Ensure signingConfigs.release exists
    if (
      !contents.includes('signingConfigs') ||
      !contents.includes('release {')
    ) {
      console.warn('Could not find signingConfigs block');
    }

    // Inject release signing config if missing
    if (!contents.includes('IO_APP_RELEASE_STORE_FILE')) {
      const signingConfigBlock = `
        release {
            if (System.getenv('IO_APP_RELEASE_STORE_FILE')) {
                storeFile file(System.getenv('IO_APP_RELEASE_STORE_FILE'))
                storePassword System.getenv('IO_APP_RELEASE_STORE_PASSWORD')
                keyAlias System.getenv('IO_APP_RELEASE_KEY_ALIAS')
                keyPassword System.getenv('IO_APP_RELEASE_KEY_PASSWORD')
            }
        }`;

      contents = contents.replace(
        /signingConfigs\s*\{/,
        match => `${match}${signingConfigBlock}`
      );
    }

    // Replace release signingConfig debug with release in the buildTypes block
    contents = contents.replace(
      /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig\s+signingConfigs\.debug/,
      `$1signingConfig signingConfigs.release`
    );

    config.modResults.contents = contents;

    return config;
  });
};
