import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

/**
 * Load Reactotron in development mode
 */
if (__DEV__) {
  require('./ReactotronConfig');
}

AppRegistry.registerComponent(appName, () => App);
