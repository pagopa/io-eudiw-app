import {
  IOVisualCostants,
  ListItemHeader,
  VStack
} from '@pagopa/io-app-design-system';
import React, {useCallback, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '../../../../store';
import {IOScrollViewWithLargeHeader} from '../../../../components/IOScrollViewWithLargeHeader';
import {
  CredentialsKeys,
  wellKnownCredential,
  wellKnownCredentialConfigurationIDs
} from '../../utils/credentials';
import {OnboardingModuleCredential} from '../../components/credential/OnboardingModuleCredential';
import {useHeaderSecondLevel} from '../../../../hooks/useHeaderSecondLevel';
import {selectCredentials} from '../../store/credentials';
import {
  resetCredentialIssuance,
  selectCredentialIssuancePreAuthStatus,
  selectRequestedCredential,
  setCredentialIssuancePreAuthRequest
} from '../../store/credentialIssuance';

/**
 * The list of the obtainable credentias.
 * Each credential has a button that allows the user to request it.
 * It also shows a badge if the credential is already saved or a loading indicator if the credential is being requested.
 */
const CredentialsList = () => {
  const {t} = useTranslation('wallet');
  const credentials = useAppSelector(selectCredentials);
  const dispatch = useAppDispatch();
  const requestedCredential = useAppSelector(selectRequestedCredential);
  const preAuthStatus = useAppSelector(selectCredentialIssuancePreAuthStatus);
  const navigation = useNavigation();

  const goBack = useCallback(() => {
    navigation.goBack();
    dispatch(resetCredentialIssuance());
  }, [dispatch, navigation]);

  const isCredentialSaved = (type: string) =>
    credentials.find(c => c.credentialType === type) !== undefined;

  const isCredentialRequested = (type: string) => requestedCredential === type;

  useHeaderSecondLevel({
    title: '',
    goBack
  });

  /**
   * If the pre auth request is successful, navigate to the trust screen
   * where the user will be requested to confirm the presentation of the required credentials and claims
   * to obtain the requested credential.
   */
  useEffect(() => {
    if (preAuthStatus.success.status) {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'CREDENTIAL_ISSUANCE_TRUST'
      });
    }
  }, [preAuthStatus.success, navigation]);

  /**
   * If an error occurs during the pre auth request, navigate to the failure screen.
   */
  useEffect(() => {
    if (preAuthStatus.error.status) {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'CREDENTIAL_ISSUANCE_FAILURE'
      });
    }
  }, [preAuthStatus.error, navigation]);

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: t('credentialIssuance.list.title')
      }}>
      <View style={styles.wrapper}>
        <ListItemHeader label={t('credentialIssuance.list.header')} />
        <VStack space={8}>
          {Object.entries(wellKnownCredential).map(([credentialKey, type]) => (
            <OnboardingModuleCredential
              key={`itw_credential_${type}`}
              type={type}
              configId={
                wellKnownCredentialConfigurationIDs[
                  credentialKey as CredentialsKeys
                ]
              }
              isSaved={isCredentialSaved(type)}
              isFetching={isCredentialRequested(
                wellKnownCredentialConfigurationIDs[
                  credentialKey as CredentialsKeys
                ]
              )}
              onPress={c =>
                dispatch(setCredentialIssuancePreAuthRequest({credential: c}))
              }
            />
          ))}
        </VStack>
      </View>
    </IOScrollViewWithLargeHeader>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 16,
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    gap: 16
  }
});

export default CredentialsList;
