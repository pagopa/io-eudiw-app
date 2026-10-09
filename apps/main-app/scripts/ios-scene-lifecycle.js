const fs = require('fs');
const path = require('path');
const {
  IOSConfig,
  withAppDelegate,
  withDangerousMod,
  withInfoPlist,
  withXcodeProject
} = require('expo/config-plugins');

/**
 * Apps built against the iOS 27 SDK are killed at launch by UIKit unless they
 * adopt the scene-based life cycle. Expo SDK 57 ships `ExpoAppSceneDelegate`,
 * but its prebuild template still generates a window-based `AppDelegate`.
 * This plugin applies the same changes as the SDK 58 template
 * (expo-template-bare-minimum@58.0.15):
 * - adds `SceneDelegate.swift` (subclass of `ExpoAppSceneDelegate`) to the target;
 * - declares it in `UIApplicationSceneManifest` in Info.plist;
 * - makes `AppDelegate` an `ExpoReactNativeFactoryProvider` and leaves window
 *   creation and React Native startup to the scene delegate. Deep links and
 *   universal links are forwarded to `RCTLinkingManager` by Expo's
 *   `SceneEventForwarder`, so the app delegate overrides are removed.
 * This plugin can be removed once the app is updated to Expo SDK 58.
 */
const SCENE_DELEGATE_FILE = 'SceneDelegate.swift';
const SCENE_DELEGATE_CONTENTS = `internal import Expo

@objc(SceneDelegate)
class SceneDelegate: ExpoAppSceneDelegate {
  // Extension point for config plugins.
}
`;

const START_REACT_NATIVE_REGEX =
  /#if os\(iOS\) \|\| os\(tvOS\)\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)\s*factory\.startReactNative\([\s\S]*?\)\s*#endif\s*/;
const LINKING_OVERRIDES_REGEX =
  /\s*\/\/ Linking API\s*public override func application\([\s\S]*?\n  }\s*\/\/ Universal Links\s*public override func application\([\s\S]*?\n  }/;

const replaceOrThrow = (contents, search, replacement, description) => {
  if (!contents.match(search)) {
    throw new Error(
      `[ios-scene-lifecycle] Could not find ${description} in AppDelegate.swift. ` +
        'The Expo template may have changed: check whether this plugin is still needed.'
    );
  }
  return contents.replace(search, replacement);
};

const withSceneDelegateAppDelegate = config =>
  withAppDelegate(config, config => {
    if (config.modResults.language !== 'swift') {
      throw new Error(
        '[ios-scene-lifecycle] Only Swift AppDelegates are supported.'
      );
    }
    let contents = config.modResults.contents;
    if (contents.includes('ExpoReactNativeFactoryProvider')) {
      return config;
    }

    contents = replaceOrThrow(
      contents,
      'class AppDelegate: ExpoAppDelegate {',
      'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {',
      'the AppDelegate class declaration'
    );
    contents = replaceOrThrow(
      contents,
      START_REACT_NATIVE_REGEX,
      '    // The window is created and React Native is started by `SceneDelegate` under the\n' +
        '    // scene-based life cycle (required by the iOS 27 SDK).\n    ',
      'the window creation and startReactNative block'
    );
    contents = replaceOrThrow(
      contents,
      LINKING_OVERRIDES_REGEX,
      '',
      'the Linking API and Universal Links overrides'
    );

    config.modResults.contents = contents;
    return config;
  });

const withSceneManifest = config =>
  withInfoPlist(config, config => {
    config.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).SceneDelegate'
          }
        ]
      }
    };
    return config;
  });

const withSceneDelegateFile = config =>
  withDangerousMod(config, [
    'ios',
    config => {
      const projectName = IOSConfig.XcodeUtils.getProjectName(
        config.modRequest.projectRoot
      );
      fs.writeFileSync(
        path.join(
          config.modRequest.platformProjectRoot,
          projectName,
          SCENE_DELEGATE_FILE
        ),
        SCENE_DELEGATE_CONTENTS
      );
      return config;
    }
  ]);

const withSceneDelegateInXcodeProject = config =>
  withXcodeProject(config, config => {
    const projectName = IOSConfig.XcodeUtils.getProjectName(
      config.modRequest.projectRoot
    );
    const filepath = `${projectName}/${SCENE_DELEGATE_FILE}`;
    if (!config.modResults.hasFile(filepath)) {
      IOSConfig.XcodeUtils.addBuildSourceFileToGroup({
        filepath,
        groupName: projectName,
        project: config.modResults
      });
    }
    return config;
  });

module.exports = config =>
  withSceneDelegateInXcodeProject(
    withSceneDelegateFile(
      withSceneManifest(withSceneDelegateAppDelegate(config))
    )
  );
