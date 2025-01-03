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
import {wellKnownCredential} from '../../utils/credentials';
import {OnboardingModuleCredential} from '../../components/OnboardingModuleCredential';
import {useHeaderSecondLevel} from '../../../../hooks/useHeaderSecondLevel';
import {selectCredentials} from '../../store/credentials';
import {
  resetCredentialIssuance,
  selectCredentialIssuancePreAuthStatus,
  selectRequestedCredential,
  setCredentialIssuancePreAuthRequest
} from '../../store/credentialIssuance';

const CredentialsList = () => {
  const {t} = useTranslation('wallet');
  const credentials = useAppSelector(selectCredentials);
  const dispatch = useAppDispatch();
  const requestedCredential = useAppSelector(selectRequestedCredential);
  const credentialIssuanceStatus = useAppSelector(
    selectCredentialIssuancePreAuthStatus
  );
  const navigation = useNavigation();

  const goBack = useCallback(() => {
    navigation.goBack();
    dispatch(resetCredentialIssuance());
  }, [dispatch, navigation]);

  useHeaderSecondLevel({
    title: '',
    goBack
  });

  useEffect(() => {
    if (credentialIssuanceStatus.success.status) {
      navigation.navigate('MAIN_WALLET', {
        screen: 'WALLET_CREDENTIAL_ISSUANCE_TRUST'
      });
    }
  }, [credentialIssuanceStatus.success, navigation]);

  useEffect(() => {
    if (credentialIssuanceStatus.error.status) {
      navigation.navigate('MAIN_WALLET', {
        screen: 'WALLET_CREDENTIAL_ISSUANCE_FAILURE'
      });
    }
  }, [credentialIssuanceStatus.error, navigation]);

  const isCredentialSaved = (type: string) =>
    credentials.find(c => c.credentialType === type) !== undefined;

  const isCredentialRequested = (type: string) => requestedCredential === type;

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: t('credentialIssuance.list.title')
      }}>
      <View style={styles.wrapper}>
        <ListItemHeader label={t('credentialIssuance.list.header')} />
        <VStack space={8}>
          {Object.entries(wellKnownCredential).map(([_, type]) => (
            <OnboardingModuleCredential
              key={`itw_credential_${type}`}
              type={type}
              isSaved={isCredentialSaved(type)}
              isFetching={isCredentialRequested(type)}
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
