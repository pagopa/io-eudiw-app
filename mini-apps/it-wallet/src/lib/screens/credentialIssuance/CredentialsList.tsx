import {
  IOScrollViewWithLargeHeader,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
import {
  IOVisualCostants,
  ListItemHeader,
  VStack
} from '@pagopa/io-app-design-system';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { OnboardingModuleCredential } from '../../components/credential/OnboardingModuleCredential';
import MAIN_ROUTES from '../../navigation/main/routes';
import WALLET_ROUTES from '../../navigation/wallet/routes';
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
 * It also shows a badge if the credential is already saved or a loading indicator if the credential is being requested.
 */
const CredentialsList = () => {
  const { t } = useTranslation('wallet');
  const credentials = useAppSelector(selectCredentials);
  const dispatch = useAppDispatch();
  const requestedCredential = useAppSelector(selectRequestedCredential);
  const navigation = useNavigation();

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
      navigation.navigate(MAIN_ROUTES.WALLET_NAV, {
        screen: WALLET_ROUTES.CREDENTIAL_ISSUANCE.TRUST
      });
    }
  }, [isFocused, preAuthStatus.success, navigation, shouldIssuePidFirst]);

  useEffect(() => {
    if (isFocused && preAuthStatus.error.status && !shouldIssuePidFirst) {
      navigation.navigate(MAIN_ROUTES.WALLET_NAV, {
        screen: WALLET_ROUTES.CREDENTIAL_ISSUANCE.FAILURE
      });
    }
  }, [isFocused, preAuthStatus.error, navigation, shouldIssuePidFirst]);

  const onCredentialPress = (credential: string) => {
    // Skip the introduction screen for PARI BONUS
    if (credential !== wellKnownCredentialConfigurationIDs.BONUS_PARI) {
      navigation.navigate(MAIN_ROUTES.WALLET_NAV, {
        params: { credential },
        screen: WALLET_ROUTES.CREDENTIAL_ISSUANCE.INTRODUCTION
      });
      return;
    }
    if (shouldIssuePidFirst) {
      dispatch(setPendingCredential({ credential }));
      navigation.navigate(MAIN_ROUTES.WALLET_NAV, {
        screen: WALLET_ROUTES.PID_ISSUANCE.INSTANCE_CREATION
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
        <ListItemHeader label={t('credentialIssuance.list.header')} />
        <VStack space={8}>
          {Object.entries(wellKnownCredential)
            .filter(([_, type]) => type !== wellKnownCredential.PID)
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
                isSaved={isCredentialSaved(type)}
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
  wrapper: {
    gap: 16,
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    paddingVertical: 16
  }
});

export default CredentialsList;
