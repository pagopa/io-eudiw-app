import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import React from 'react';
import {OperationResultScreenContent} from '../../../../components/screens/OperationResultScreenContent';
import {resetPidIssuance} from '../../store/pidIssuance';
import {useAppDispatch} from '../../../../store';

const Success = () => {
  const {t} = useTranslation(['wallet']);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  return (
    <OperationResultScreenContent
      pictogram="success"
      title={t('wallet:pidIssuance.success.title')}
      subtitle={t('wallet:pidIssuance.success.subtitle')}
      action={{
        accessibilityLabel: t('wallet:pidIssuance.success.buttons.add'),
        label: t('wallet:pidIssuance.success.buttons.add'),
        onPress: () => {
          dispatch(resetPidIssuance());
          navigation.navigate('MAIN_TAB_NAV');
        }
      }}
      secondaryAction={{
        label: t('wallet:pidIssuance.success.buttons.later'),
        accessibilityLabel: t('wallet:pidIssuance.success.buttons.later'),
        onPress: () => {
          dispatch(resetPidIssuance());
          navigation.navigate('MAIN_TAB_NAV');
        }
      }}
    />
  );
};

export default Success;
