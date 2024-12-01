import Config from 'react-native-config';
import {configSchema} from './types/react-native-config';

/**
 * This function checks the Config object to ensure that all required values are defined.
 * It must be called before any other code in the app.
 * If a required value is not defined or is in a wrong format, an error is thrown.
 */
export const checkConfig = () => configSchema.parse(Config);
