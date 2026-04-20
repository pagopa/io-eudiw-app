jest.mock('expo/src/winter/ImportMetaRegistry', () => ({
  ImportMetaRegistry: {
    get url() {
      return null;
    }
  }
}));

// 2. Mock the library interface
jest.mock('react-native-device-info', () => {
  return {
    getVersion: jest.fn(() => '1.0.0'),
    getReadableVersion: jest.fn(() => '1.0.0.1'),
    getBuildNumber: jest.fn(() => '1')
  };
});

if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = object => JSON.parse(JSON.stringify(object));
}
