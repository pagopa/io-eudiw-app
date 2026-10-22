import {
  IOScrollViewWithLargeHeader,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
import {
  H6,
  IOListItemVisualParams,
  IOVisualCostants,
  useIOTheme,
  VStack
} from '@pagopa/io-app-design-system';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { OnboardingModuleCredential } from '../../components/credential/OnboardingModuleCredential';
import { PoweredByItWalletText } from '../../components/PoweredByItWalletText';
import CREDENTIAL_ISSUANCE_ROUTES from '../../navigation/credentialIssuance/routes';
import MAIN_ROUTES from '../../navigation/main/routes';
import PID_ISSUANCE_ROUTES from '../../navigation/pidIssuance/routes';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  resetCredentialIssuance,
  selectCredentialIssuancePreAuthStatus,
  selectRequestedCredential,
  setCredentialIssuancePreAuthRequest
} from '../../store/credentialIssuance';
import { selectCredentials } from '../../store/credentials';
import { lifecycleIsOperationalSelector } from '../../store/lifecycle';
import { setPendingCredential } from '../../store/pidIssuance';
import {
  CredentialsKeys,
  wellKnownCredential,
  wellKnownCredentialConfigurationIDs
} from '../../utils/credentials';

/**
 * The list of the obtainable credentias.
 * Each credential has a button that allows the user to request it.
 * Credentials already in the wallet are hidden, and a loading indicator is shown while a credential is being requested.
 */
const CredentialsList = () => {
  const { t } = useTranslation('wallet');
  const credentials = useAppSelector(selectCredentials);
  const dispatch = useAppDispatch();
  const requestedCredential = useAppSelector(selectRequestedCredential);
  const navigation = useNavigation();
  const theme = useIOTheme();

  const goBack = useCallback(() => {
    navigation.goBack();
    dispatch(resetCredentialIssuance());
  }, [dispatch, navigation]);

  const isCredentialSaved = (type: string) =>
    credentials.find(c => c.credentialType === type) !== undefined;

  const isCredentialRequested = (type: string) => requestedCredential === type;

  const shouldIssuePidFirst = useAppSelector(lifecycleIsOperationalSelector);
  const preAuthStatus = useAppSelector(selectCredentialIssuancePreAuthStatus);
  const isFocused = useIsFocused();

  // Credentials which skip the introduction are issued directly from this
  // screen, so the issuance outcome is handled here only while it's focused.
  useEffect(() => {
    if (isFocused && preAuthStatus.success.status && !shouldIssuePidFirst) {
      navigation.navigate(MAIN_ROUTES.CREDENTIAL_ISSUANCE_NAV, {
        screen: CREDENTIAL_ISSUANCE_ROUTES.TRUST
      });
    }
  }, [isFocused, preAuthStatus.success, navigation, shouldIssuePidFirst]);

  useEffect(() => {
    if (isFocused && preAuthStatus.error.status && !shouldIssuePidFirst) {
      navigation.navigate(MAIN_ROUTES.CREDENTIAL_ISSUANCE_NAV, {
        screen: CREDENTIAL_ISSUANCE_ROUTES.FAILURE
      });
    }
  }, [isFocused, preAuthStatus.error, navigation, shouldIssuePidFirst]);

  const onCredentialPress = (credential: string) => {
    // Skip the introduction screen for PARI BONUS
    if (credential !== wellKnownCredentialConfigurationIDs.BONUS_PARI) {
      navigation.navigate(MAIN_ROUTES.CREDENTIAL_ISSUANCE_NAV, {
        params: { credential },
        screen: CREDENTIAL_ISSUANCE_ROUTES.INTRODUCTION
      });
      return;
    }
    if (shouldIssuePidFirst) {
      dispatch(setPendingCredential({ credential }));
      navigation.navigate(MAIN_ROUTES.PID_ISSUANCE_NAV, {
        screen: PID_ISSUANCE_ROUTES.INSTANCE_CREATION
      });
      return;
    }
    dispatch(setCredentialIssuancePreAuthRequest({ credential }));
  };

  useHeaderSecondLevel({
    goBack,
    title: ''
  });

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: t('credentialIssuance.list.title')
      }}
    >
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <H6 color={theme['textBody-tertiary']} role="heading">
            {t('credentialIssuance.list.header')}
          </H6>
          <PoweredByItWalletText />
        </View>
        <VStack space={8}>
          {Object.entries(wellKnownCredential)
            .filter(
              ([_, type]) =>
                type !== wellKnownCredential.PID && !isCredentialSaved(type)
            )
            .map(([credentialKey, type]) => (
              <OnboardingModuleCredential
                configId={
                  wellKnownCredentialConfigurationIDs[
                    credentialKey as CredentialsKeys
                  ]
                }
                isFetching={isCredentialRequested(
                  wellKnownCredentialConfigurationIDs[
                    credentialKey as CredentialsKeys
                  ]
                )}
                key={`itw_credential_${type}`}
                onPress={onCredentialPress}
                type={type}
              />
            ))}
        </VStack>
      </View>
    </IOScrollViewWithLargeHeader>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: IOListItemVisualParams.paddingVertical
  },
  wrapper: {
    gap: 16,
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    paddingVertical: 16
  }
});

export default CredentialsList;
