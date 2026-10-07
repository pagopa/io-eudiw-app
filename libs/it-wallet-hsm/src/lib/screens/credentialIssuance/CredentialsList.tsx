import {
  IOScrollViewWithLargeHeader,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
import {
  IOVisualCostants,
  ListItemHeader,
  VStack
} from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
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

  const preAuthStatus = useAppSelector(selectCredentialIssuancePreAuthStatus);

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
                dispatch(
                  setCredentialIssuancePreAuthRequest({ credential: c })
                )
              }
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
