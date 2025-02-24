import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import React from 'react';
import {useAppDispatch, useAppSelector} from '../../../../store';
import {OperationResultScreenContent} from '../../../../components/screens/OperationResultScreenContent';
import {useHardwareBackButton} from '../../../../hooks/useHardwareBackButton';
import {
  resetCredentialIssuance,
  selectCredentialIssuancePostAuthError,
  selectCredentialIssuancePreAuthError
} from '../../store/credentialIssuance';
import {useDebugInfo} from '../../../../hooks/useDebugInfo';

/**
 * Filure screen of the credential issuance flow.
 * Currently it only shows a message and a button to go back to the main screen, along with the debug information.
 */
const CredentialFailure = () => {
  const {t} = useTranslation(['global', 'wallet']);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const postError = useAppSelector(selectCredentialIssuancePostAuthError);
  const preError = useAppSelector(selectCredentialIssuancePreAuthError);

  useHardwareBackButton(() => true);

  useDebugInfo({postError, preError});

  const onPress = () => {
    dispatch(resetCredentialIssuance());
    navigation.navigate('MAIN_TAB_NAV');
  };

  return (
    <OperationResultScreenContent
      pictogram="umbrellaNew"
      title={t('wallet:credentialIssuance.failure.title')}
      subtitle={t('wallet:credentialIssuance.failure.subtitle')}
      action={{
        accessibilityLabel: t('global:buttons.back'),
        label: t('global:buttons.back'),
        onPress
      }}
    />
  );
};

export default CredentialFailure;
