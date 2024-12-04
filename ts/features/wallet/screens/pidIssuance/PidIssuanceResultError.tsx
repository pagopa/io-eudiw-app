import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import React from 'react';
import {useAppDispatch} from '../../../../store';
import {OperationResultScreenContent} from '../../../../components/screens/OperationResultScreenContent';
import {resetPidIssuanceFirstFlow} from '../../store/pidIssuance';

const PidIssuanceResultError = () => {
  const {t} = useTranslation(['global']);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  return (
    <OperationResultScreenContent
      pictogram="fatalError"
      title={t('global:errors.generic.title')}
      subtitle={t('global:errors.generic.body')}
      action={{
        accessibilityLabel: t('global:buttons.back'),
        label: t('global:buttons.back'),
        onPress: () => {
          dispatch(resetPidIssuanceFirstFlow());
          navigation.navigate('MAIN_TAB_NAV');
        }
      }}
    />
  );
};

export default PidIssuanceResultError;
