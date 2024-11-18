import Config from 'react-native-config';

/**
 * This function checks the Config object to ensure that all required values are defined.
 * It must be called before any other code in the app.
 * If a required value is not defined, an error is thrown.
 */
export const checkConfig = () => {
  if (!Config.TEST) {
    throw new Error('TEST IS NOT DEFINED');
  }
};
