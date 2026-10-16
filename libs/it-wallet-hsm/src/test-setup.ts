jest.mock('react-i18next', () => ({
  initReactI18next: {
    init: jest.fn(),
    type: '3rdParty'
  },
  useTranslation: () => ({
    i18n: {
      changeLanguage: jest.fn(() => Promise.resolve()),
      language: 'it-IT'
    },
    t: (key: string) => key
  })
}));

jest.mock('i18next', () => ({
  language: 'it-IT'
}));

jest.mock('react-native-worklets', () =>
  require('react-native-worklets/src/mock')
);

jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => {
  const turboModuleRegistry = jest.requireActual(
    'react-native/Libraries/TurboModule/TurboModuleRegistry'
  );
  return {
    ...turboModuleRegistry,
    getEnforcing: (name: string) => {
      const modulesToMock = ['RNHapticFeedback'];
      if (modulesToMock.includes(name)) {
        return null;
      }
      return turboModuleRegistry.getEnforcing(name);
    }
  };
});

jest.mock('react-native-device-info', () =>
  require('react-native-device-info/jest/react-native-device-info-mock')
);

jest.mock('expo/src/winter/ImportMetaRegistry', () => ({
  ImportMetaRegistry: {
    get url() {
      return null;
    }
  }
}));

if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = object => JSON.parse(JSON.stringify(object));
}
