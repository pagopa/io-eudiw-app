import React, {memo, useCallback, useMemo} from 'react';
import {Linking, StyleSheet, View} from 'react-native';
import {WebView, WebViewNavigation} from 'react-native-webview';
import i18next from 'i18next';
import Config from 'react-native-config';
import LoadingScreenContent from '../../../../components/LoadingScreenContent';
import {
  HeaderSecondLevelHookProps,
  useHeaderSecondLevel
} from '../../../../hooks/useHeaderSecondLevel';
import {isDevEnv} from '../../../../utils/env';
import {getIntentFallbackUrl} from '../../utils/auth';
import {useAppSelector} from '../../../../store';
import {selectAuthUrl} from '../../store/pidIssuance';
import {LoadingIndicator} from '../../../../components/ui/LoadingIndicator';

// To ensure the server recognizes the client as a valid mobile device, we use a custom user agent header.
const defaultUserAgent =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X; Linux; Android 10) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';

// if the app is running in dev env, add "http" to allow the dev-server usage
export const originSchemasWhiteList = [
  'https://*',
  'intent://*',
  'iologin://*',
  ...(isDevEnv ? ['http://*'] : [])
];

/**
 * This component renders a WebView that loads the URL obtained from the startAuthFlow.
 * It handles the navigation state changes to detect when the authentication is completed
 * and sends the redirectAuthUrl back to the state machine.
 */
const StrongAuthentication = () => {
  const authUrl = useAppSelector(selectAuthUrl);
  const [isLoading, setIsLoading] = React.useState(true);

  const onError = useCallback(() => {}, []);

  const handleShouldStartLoading = useCallback(
    (event: WebViewNavigation): boolean => {
      const url = event.url;
      const idpIntent = getIntentFallbackUrl(url);
      if (idpIntent) {
        void Linking.openURL(idpIntent);
        return false;
      } else {
        return true;
      }
    },
    []
  );

  const handleNavigationStateChange = useCallback(
    (event: WebViewNavigation) => {
      const isIssuanceRedirect = event.url.startsWith(Config.PID_REDIRECT_URI);

      if (isIssuanceRedirect) {
        console.log('here');
      }
    },
    []
  );

  // Setup header properties
  const headerProps: HeaderSecondLevelHookProps = {
    title: '',
    supportRequest: false
  };

  useHeaderSecondLevel(headerProps);

  const renderMask = () => {
    // in order to prevent graphic glitches when navigating
    // to the error screen the spinner is shown also when the login has failed
    if (isLoading) {
      return (
        <View style={styles.refreshIndicatorContainer}>
          <LoadingIndicator />
        </View>
      );
    }
    // loading complete, no mask needed
    return null;
  };

  const content = useMemo(() => {
    if (!authUrl) {
      return null; // should show error
    } else {
      return (
        <WebView
          cacheEnabled={false}
          androidCameraAccessDisabled
          androidMicrophoneAccessDisabled
          javaScriptEnabled
          textZoom={100}
          originWhitelist={originSchemasWhiteList}
          source={{uri: authUrl}}
          onError={onError}
          onHttpError={onError}
          onNavigationStateChange={handleNavigationStateChange}
          onShouldStartLoadWithRequest={handleShouldStartLoading}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction
          userAgent={defaultUserAgent}
          onLoadEnd={() => setIsLoading(false)}
        />
      );
    }
  }, [authUrl, onError, handleNavigationStateChange, handleShouldStartLoading]);

  return (
    <View style={styles.webViewWrapper}>
      {content}
      {renderMask()}
    </View>
  );
};

export default memo(StrongAuthentication);

const styles = StyleSheet.create({
  refreshIndicatorContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  webViewWrapper: {flex: 1}
});
