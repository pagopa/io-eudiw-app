import {
  BodySmall,
  useIOTheme,
  WithTestID
} from '@pagopa/io-app-design-system';
import { GestureResponderEvent, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getAppVersion } from '@io-eudiw-app/commons';

export type AppVersionProps = WithTestID<{
  onPress: (event: GestureResponderEvent) => void;
}>;

const AppVersion = ({ onPress, testID }: AppVersionProps) => {
  const theme = useIOTheme();
  const { t } = useTranslation(['wallet']);
  const appVersion = getAppVersion();
  const appVersionText = `${t('settings.version')} ${appVersion}`;

  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityLabel={appVersionText}
    >
      <View
        style={{
          paddingVertical: 20,
          alignSelf: 'flex-start',
          flexDirection: 'row',
          alignItems: 'center'
        }}
      >
        <BodySmall
          numberOfLines={1}
          weight="Semibold"
          color={theme['textBody-tertiary']}
        >
          {appVersionText}
        </BodySmall>
      </View>
    </Pressable>
  );
};

export default AppVersion;
