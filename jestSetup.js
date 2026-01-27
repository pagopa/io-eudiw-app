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
