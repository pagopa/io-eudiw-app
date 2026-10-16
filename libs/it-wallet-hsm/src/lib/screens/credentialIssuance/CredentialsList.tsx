import { IOScrollView, useHeaderSecondLevel } from '@io-eudiw-app/commons';
import {
  ListItemHeader,
  useIOToast,
  VStack
} from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { OnboardingModuleCredential } from '../../components/credential/OnboardingModuleCredential';
import { getWalletInstanceAttestationThunk } from '../../middleware/attestation';
import { createInstanceThunk } from '../../middleware/instance';
import MAIN_ROUTES from '../../navigation/main/routes';
import WALLET_ROUTES from '../../navigation/wallet/routes';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  selectWalletInstanceAttestationRequestStatus,
  shouldRequestWalletInstanceAttestationSelector
} from '../../store/attestationSelectors';
import {
  resetCredentialIssuance,
  selectCredentialIssuancePostAuthStatus,
  selectCredentialIssuancePreAuthStatus,
  selectRequestedCredential,
  setCredentialIssuancePreAuthRequest
} from '../../store/credentialIssuance';
import { selectCredentials } from '../../store/credentials';
import {
  selectInstanceCreationStatus,
  selectInstanceKeyTag
} from '../../store/instanceSelectors';
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
  const { t } = useTranslation('itWalletHsm');
  const { t: tCommon } = useTranslation('common');
  const credentials = useAppSelector(selectCredentials);
  const dispatch = useAppDispatch();
  const toast = useIOToast();
  const requestedCredential = useAppSelector(selectRequestedCredential);
  const navigation = useNavigation();
  const instanceKeyTag = useAppSelector(selectInstanceKeyTag);
  const instanceCreationStatus = useAppSelector(selectInstanceCreationStatus);
  const hasWalletInstance = instanceKeyTag !== undefined;
  const shouldRequestAttestation = useAppSelector(
    shouldRequestWalletInstanceAttestationSelector
  );
  const attestationRequestStatus = useAppSelector(
    selectWalletInstanceAttestationRequestStatus
  );

  const goBack = useCallback(() => {
    navigation.goBack();
    dispatch(resetCredentialIssuance());
  }, [dispatch, navigation]);

  const isCredentialSaved = (type: string) =>
    credentials.find(c => c.credentialType === type) !== undefined;

  const isCredentialRequested = (type: string) => requestedCredential === type;

  const preAuthStatus = useAppSelector(selectCredentialIssuancePreAuthStatus);
  const postAuthStatus = useAppSelector(selectCredentialIssuancePostAuthStatus);
  const isPidIssuance =
    requestedCredential === wellKnownCredentialConfigurationIDs.PID;

  const activateWalletInstance = useCallback(async () => {
    try {
      await dispatch(createInstanceThunk()).unwrap();
      toast.success(tCommon('generics.success'));
    } catch {
      toast.error(tCommon('errors.generic'));
    }
  }, [dispatch, tCommon, toast]);

  const activateWalletAttestation = useCallback(async () => {
    if (!hasWalletInstance) {
      toast.error(tCommon('errors.generic'));
      return;
    }
    try {
      await dispatch(getWalletInstanceAttestationThunk()).unwrap();
      toast.success(tCommon('generics.success'));
    } catch {
      toast.error(tCommon('errors.generic'));
    }
  }, [dispatch, hasWalletInstance, tCommon, toast]);

  useEffect(() => {
    if (preAuthStatus.success.status) {
      navigation.navigate(MAIN_ROUTES.WALLET_NAV, {
        screen: WALLET_ROUTES.CREDENTIAL_ISSUANCE.TRUST
      });
    }
  }, [preAuthStatus.success, navigation]);

  useEffect(() => {
    if (preAuthStatus.error.status) {
      navigation.navigate(MAIN_ROUTES.WALLET_NAV, {
        screen: WALLET_ROUTES.CREDENTIAL_ISSUANCE.FAILURE
      });
    }
  }, [preAuthStatus.error, navigation]);

  useEffect(() => {
    if (isPidIssuance && postAuthStatus.success.status) {
      navigation.navigate(MAIN_ROUTES.WALLET_NAV, {
        screen: WALLET_ROUTES.CREDENTIAL_ISSUANCE.PREVIEW
      });
    }
    if (isPidIssuance && postAuthStatus.error.status) {
      navigation.navigate(MAIN_ROUTES.WALLET_NAV, {
        screen: WALLET_ROUTES.CREDENTIAL_ISSUANCE.FAILURE
      });
    }
  }, [
    isPidIssuance,
    navigation,
    postAuthStatus.error.status,
    postAuthStatus.success.status
  ]);

  useHeaderSecondLevel({
    goBack,
    title: ''
  });

  return (
    <IOScrollView>
      <View style={styles.wrapper}>
        <View style={styles.sectionWrapper}>
          <ListItemHeader label={t('credentialIssuance.list.walletProvider')} />
          <VStack space={8}>
            <OnboardingModuleCredential
              configId="wallet-instance-creation"
              isFetching={instanceCreationStatus.loading}
              isSaved={hasWalletInstance}
              onPress={() => void activateWalletInstance()}
              type={t('credentialIssuance.list.instance')}
            />
            <OnboardingModuleCredential
              configId="wallet-instance-attestation"
              isFetching={attestationRequestStatus.loading}
              isSaved={!shouldRequestAttestation}
              onPress={() => void activateWalletAttestation()}
              type={t('credentialIssuance.list.attestation')}
            />
          </VStack>
        </View>
        <ListItemHeader label={t('credentialIssuance.list.documents')} />
        <VStack space={8}>
          {Object.entries(wellKnownCredential).map(([credentialKey, type]) => (
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
              onPress={c =>
                dispatch(setCredentialIssuancePreAuthRequest({ credential: c }))
              }
              type={type}
            />
          ))}
        </VStack>
      </View>
    </IOScrollView>
  );
};

const styles = StyleSheet.create({
  sectionWrapper: {
    gap: 8
  },
  wrapper: {
    gap: 16
  }
});

export default CredentialsList;
