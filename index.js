import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
// eslint-disable-next-line no-unused-vars
import i18next from './ts/i18n/i18n'; // Needed to initialize i18next

AppRegistry.registerComponent(appName, () => App);
