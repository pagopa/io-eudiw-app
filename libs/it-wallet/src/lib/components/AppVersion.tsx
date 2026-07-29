import { getAppVersion } from '@io-eudiw-app/commons';
import {
  BodySmall,
  useIOTheme,
  WithTestID
} from '@pagopa/io-app-design-system';
import { useTranslation } from 'react-i18next';
import { GestureResponderEvent, Pressable, View } from 'react-native';

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
      accessibilityLabel={appVersionText}
      onPress={onPress}
      testID={testID}
    >
      <View
        style={{
          alignItems: 'center',
          alignSelf: 'flex-start',
          flexDirection: 'row',
          paddingVertical: 20
        }}
      >
        <BodySmall
          color={theme['textBody-tertiary']}
          numberOfLines={1}
          weight="Semibold"
        >
          {appVersionText}
        </BodySmall>
      </View>
    </Pressable>
  );
};

export default AppVersion;
