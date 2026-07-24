const { withProjectBuildGradle } = require('@expo/config-plugins');

/**
 * These legacy native modules apply the React Gradle plugin but do not provide
 * a codegenConfig. React Native then generates its core specs inside each
 * module, causing duplicate classes during mergeLibDexDebug.
 * This is caused by `io-react-native-jwt` and `io-react-native-crypto` libraries. 
 * This patch can be removed once these libraries are updated 
 */
const GRADLE_FIX_MARKER = 'Fix duplicate codegen classes from PagoPA legacy modules';
const GRADLE_FIX = `

// ${GRADLE_FIX_MARKER}
subprojects { subproject ->
    if (subproject.name in [
        'pagopa_io-react-native-crypto',
        'pagopa_io-react-native-jwt'
    ]) {
        subproject.plugins.withId('com.facebook.react') {
            subproject.tasks.configureEach { task ->
                if (task.name in [
                    'generateCodegenSchemaFromJavaScript',
                    'generateCodegenArtifactsFromSchema'
                ]) {
                    task.enabled = false
                }

                if (task.name == 'preBuild') {
                    task.doFirst {
                        subproject.delete(
                            subproject.layout.buildDirectory.dir(
                                'generated/source/codegen'
                            )
                        )
                    }
                }
            }
        }
    }
}
`;

module.exports = config =>
  withProjectBuildGradle(config, config => {
    if (!config.modResults.contents.includes(GRADLE_FIX_MARKER)) {
      config.modResults.contents += GRADLE_FIX;
    }

    return config;
  });
