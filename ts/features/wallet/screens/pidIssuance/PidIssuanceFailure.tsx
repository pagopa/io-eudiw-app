import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import React from 'react';
import {useAppDispatch} from '../../../../store';
import {OperationResultScreenContent} from '../../../../components/screens/OperationResultScreenContent';
import {resetInstanceCreation, resetPidIssuance} from '../../store/pidIssuance';
import {useHardwareBackButton} from '../../../../hooks/useHardwareBackButton';

/**
 * Filure screen of the pid issuance flow.
 * Currently it only shows a message and a button to go back to the main screen.
 */
const PidIssuanceFailure = () => {
  const {t} = useTranslation(['global', 'wallet']);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  useHardwareBackButton(() => true);

  const onPress = () => {
    dispatch(resetInstanceCreation());
    dispatch(resetPidIssuance());
    navigation.navigate('MAIN_TAB_NAV');
  };

  return (
    <OperationResultScreenContent
      pictogram="umbrellaNew"
      title={t('wallet:pidIssuance.failure.title')}
      subtitle={t('wallet:pidIssuance.failure.subtitle')}
      action={{
        accessibilityLabel: t('global:buttons.back'),
        label: t('global:buttons.back'),
        onPress
      }}
    />
  );
};

export default PidIssuanceFailure;
