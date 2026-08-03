import { usePreventScreenCapture } from '@io-eudiw-app/commons';
import { selectIsDebugModeEnabled } from '@io-eudiw-app/debug-info';
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

import { ItwPresentationCredentialCard } from '../../components/presentation/ItwPresentationCredentialCard';
import { WalletNavigatorParamsList } from '../../navigation/wallet/WalletNavigator';
import { useAppSelector } from '../../store';
import { selectCredential } from '../../store/credentials';
import { parseClaimsToRecord } from '../../utils/claims';
import { WellKnownClaim } from '../../utils/itwClaimsUtils';
import { getCredentialCapabilities } from '../../utils/itwCredentialCapabilities';

export type ItwPresentationCredentialCardScreenNavigationParams = {
  credentialType: string;
};

type Props = StackScreenProps<
  WalletNavigatorParamsList,
  'PRESENTATION_CREDENTIAL_CARD_SCREEN'
>;

const ItwPresentationCredentialCardScreen = ({ navigation, route }: Props) => {
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
          firstAction={{
            accessibilityLabel: t('buttons.close', { ns: 'common' }),
            icon: 'closeLarge',
            onPress: () => navigation.goBack()
          }}
          title=""
          type="singleAction"
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
          backgroundColor: IOColors[theme['appBackground-primary']],
          paddingBottom: safeAreaInsets.bottom
        }
      ]}
    >
      <ItwPresentationCredentialCard
        capabilities={getCredentialCapabilities(credentialType)}
        credential={credential}
        parsedClaims={claims}
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
