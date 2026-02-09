import { BodySmall } from '@pagopa/io-app-design-system';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { getAppVersion } from '../utils/device';

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
export const AppVersion = () => {
  const appVersion = getAppVersion();
  const { t } = useTranslation('global');
  const appVersionText = `${t('settings.version')} ${appVersion}`;

  return (
    <View style={styles.versionButton}>
      <BodySmall numberOfLines={1} weight="Semibold" color="grey-650">
        {appVersionText}
      </BodySmall>
    </View>
  );
};
