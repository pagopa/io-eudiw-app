import {
  HeaderSecondLevel,
  IOColors,
  useIOTheme
} from '@pagopa/io-app-design-system';
import { StackScreenProps } from '@react-navigation/stack';
import { t } from 'i18next';
import { useLayoutEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WalletNavigatorParamsList } from '../../navigation/wallet/WalletNavigator';
import { usePreventScreenCapture } from '@io-eudiw-app/commons';
import { useAppSelector } from '../../store';
import { selectIsDebugModeEnabled } from '@io-eudiw-app/debug-info';
import { selectCredential } from '../../store/credentials';
import { ItwPresentationCredentialCard } from '../../components/presentation/ItwPresentationCredentialCard';
import { parseClaimsToRecord } from '../../utils/claims';
import { getCredentialCapabilities } from '../../utils/itwCredentialCapabilities';
import { WellKnownClaim } from '../../utils/itwClaimsUtils';

export type ItwPresentationCredentialCardScreenNavigationParams = {
  credentialType: string;
};

type Props = StackScreenProps<
  WalletNavigatorParamsList,
  'PRESENTATION_CREDENTIAL_CARD_SCREEN'
>;

const ItwPresentationCredentialCardScreen = ({ route, navigation }: Props) => {
  const { credentialType } = route.params;
  const credential = useAppSelector(selectCredential(credentialType));
  const theme = useIOTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const isDebugEnabled = useAppSelector(selectIsDebugModeEnabled);

  usePreventScreenCapture(isDebugEnabled);

  const claims = useMemo(
    () =>
      credential
        ? parseClaimsToRecord(credential.parsedCredential, {
            exclude: [WellKnownClaim.unique_id, WellKnownClaim.content]
          })
        : undefined,
    [credential]
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          title=""
          type="singleAction"
          firstAction={{
            icon: 'closeLarge',
            accessibilityLabel: t('buttons.close', { ns: 'common' }),
            onPress: () => navigation.goBack()
          }}
        />
      )
    });
  }, [navigation]);

  if (!credential || !claims) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: safeAreaInsets.bottom,
          backgroundColor: IOColors[theme['appBackground-primary']]
        }
      ]}
    >
      <ItwPresentationCredentialCard
        credential={credential}
        parsedClaims={claims}
        capabilities={getCredentialCapabilities(credentialType)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start'
  }
});

export { ItwPresentationCredentialCardScreen };
