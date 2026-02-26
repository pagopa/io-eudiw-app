/* eslint-disable no-undef */
import initI18n from './ts/i18n/i18n.ts';

void initI18n();

jest.mock('react-native-haptic-feedback', () => ({
  ...jest.requireActual('react-native-haptic-feedback'),
  trigger: jest.fn()
}));

/*
 * Turbo modules mocks.
 */

jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => {
  const turboModuleRegistry = jest.requireActual(
    'react-native/Libraries/TurboModule/TurboModuleRegistry'
  );
  return {
    ...turboModuleRegistry,
    getEnforcing: name => {
      // List of TurboModules libraries to mock.
      const modulesToMock = ['RNHapticFeedback'];
      if (modulesToMock.includes(name)) {
        return null;
      }
      return turboModuleRegistry.getEnforcing(name);
    }
  };
});

// Mock react-native-worklets before reanimated setup
// See: https://docs.swmansion.com/react-native-worklets/docs/guides/testing/
jest.mock('react-native-worklets', () =>
  require('react-native-worklets/lib/module/mock')
);

// Setup react-native-reanimated for testing (v4.x)
// See: https://docs.swmansion.com/react-native-reanimated/docs/guides/testing/
const { setUpTests } = require('react-native-reanimated');
setUpTests();
