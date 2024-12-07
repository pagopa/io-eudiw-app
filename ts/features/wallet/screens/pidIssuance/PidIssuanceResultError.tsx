import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {WalletNavigatorParamsList} from '../../navigation/WalletNavigator';
import {useAppDispatch} from '../../../../store';
import {
  PidIssuanceStatusKeys,
  resetPidIssuanceStatus
} from '../../store/pidIssuance';
import {OperationResultScreenContent} from '../../../../components/screens/OperationResultScreenContent';

export type PidIssuanceResultErrorNavigationParams = {
  key: PidIssuanceStatusKeys;
};

type PidIssuanceResultErrorRouteProps = NativeStackScreenProps<
  WalletNavigatorParamsList,
  'RESULT_ERROR'
>;

const PidIssuanceResultError = ({route}: PidIssuanceResultErrorRouteProps) => {
  const {t} = useTranslation(['global']);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const key = route.params.key;

  return (
    <OperationResultScreenContent
      pictogram="fatalError"
      title={t('global:errors.generic.title')}
      subtitle={t('global:errors.generic.body')}
      action={{
        accessibilityLabel: t('global:buttons.back'),
        label: t('global:buttons.back'),
        onPress: () => {
          dispatch(resetPidIssuanceStatus({key}));
          navigation.navigate('MAIN_TAB_NAV');
        }
      }}
    />
  );
};

export default PidIssuanceResultError;
