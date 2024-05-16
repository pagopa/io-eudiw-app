/**
 * Main app entrypoint
 */
import "@pagopa/react-native-nodelibs/globals";
import { AppRegistry } from "react-native";
import App from "./ts/App";
import { name as appName } from "./app.json";

AppRegistry.registerComponent(appName, () => App);
