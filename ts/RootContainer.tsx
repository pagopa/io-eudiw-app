import React from "react";
import SplashScreen from "react-native-splash-screen";
import {
  AppState,
  AppStateStatus,
  NativeEventSubscription,
  StatusBar
} from "react-native";
import { connect } from "react-redux";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import customVariables from "./theme/variables";
import { IONavigationContainer } from "./navigation/AppStackNavigator";
import { applicationChangeState } from "./store/actions/application";
import { setLocale } from "./i18n";
import { setDebugCurrentRouteName } from "./store/actions/debug";
import { isDebugModeEnabledSelector } from "./store/reducers/debug";
import { GlobalState } from "./store/reducers/types";
import { preferredLanguageSelector } from "./store/reducers/persistedPreferences";
import RootModal from "./screens/modal/RootModal";
import { LightModalRoot } from "./components/ui/LightModal";

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

/**
 * The main container of the application with:
 * - the Navigator
 * - the IdentificationModal, for authenticating user after login by CIE/SPID
 * - the SystemOffModal, shown if backend is unavailable
 * - the UpdateAppModal, if the backend is not compatible with the installed app version
 * - the root for displaying light modals
 */
class RootContainer extends React.PureComponent<Props> {
  private subscription: NativeEventSubscription | undefined;
  constructor(props: Props) {
    super(props);
    /* Configure the application to receive push notifications */
    // configurePushNotifications();
  }

  private handleApplicationActivity = (activity: AppStateStatus) =>
    this.props.applicationChangeState(activity);

  public componentDidMount() {
    // boot: send the status of the application
    this.handleApplicationActivity(AppState.currentState);
    // eslint-disable-next-line functional/immutable-data
    this.subscription = AppState.addEventListener(
      "change",
      this.handleApplicationActivity
    );

    this.updateLocale();
    // Hide splash screen
    SplashScreen.hide();
  }

  /**
   * If preferred language is set in the Persisted Store it sets the app global Locale
   * otherwise it continues using the default locale set from the SO
   */
  private updateLocale = () =>
    pipe(
      this.props.preferredLanguage,
      O.map(l => {
        setLocale(l);
      })
    );

  public componentWillUnmount() {
    this.subscription?.remove();
  }

  public componentDidUpdate() {
    this.updateLocale();
  }

  public render() {
    return (
      <>
        <StatusBar
          barStyle={"dark-content"}
          backgroundColor={customVariables.androidStatusBarColor}
        />

        <IONavigationContainer />
        <RootModal />
        <LightModalRoot />
      </>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  preferredLanguage: preferredLanguageSelector(state),
  isDebugModeEnabled: isDebugModeEnabledSelector(state)
});

const mapDispatchToProps = {
  applicationChangeState,
  setDebugCurrentRouteName
};

export default connect(mapStateToProps, mapDispatchToProps)(RootContainer);
