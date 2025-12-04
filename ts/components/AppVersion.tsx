import * as React from 'react';
import {GestureResponderEvent, StyleSheet, View} from 'react-native';
import {BodySmall, WithTestID} from '@pagopa/io-app-design-system';
import {useTranslation} from 'react-i18next';
import {getAppVersion} from '../utils/device';

export type AppVersion = WithTestID<{
  onPress: (event: GestureResponderEvent) => void;
}>;

const styles = StyleSheet.create({
  versionButton: {
    paddingVertical: 20,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center'
  }
});

/**
 * This component renders a text with the current app version, to be shown in the settings screen.
 */
const AppVersion = () => {
  const appVersion = getAppVersion();
  const {t} = useTranslation('global');
  const appVersionText = `${t('settings.version')} ${appVersion}`;

  return (
    <View style={styles.versionButton}>
      <BodySmall numberOfLines={1} weight="Semibold" color="grey-650">
        {appVersionText}
      </BodySmall>
    </View>
  );
};

export default AppVersion;
