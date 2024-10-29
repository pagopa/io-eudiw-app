/**
 * Main app entrypoint
 */
import "@pagopa/react-native-nodelibs/globals";
import "react-native-get-random-values";
import { AppRegistry } from "react-native";
import { App } from "./ts/App";
import { name as appName } from "./app.json";
import "react-native-reanimated";
import './shim';

AppRegistry.registerComponent(appName, () => App);
