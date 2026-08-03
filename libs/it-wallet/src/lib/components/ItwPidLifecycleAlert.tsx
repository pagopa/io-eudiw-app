import { Alert } from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { format } from 'date-fns';
import { t } from 'i18next';
import { ComponentProps } from 'react';
import { View } from 'react-native';

import { MainNavigatorParamsList } from '../navigation/main/MainStackNavigator';
import MAIN_ROUTES from '../navigation/main/routes';
import WALLET_ROUTES from '../navigation/wallet/routes';
import { useAppSelector } from '../store';
import {
  itwCredentialsPidSelector,
  itwCredentialsPidStatusSelector
} from '../store/credentials';
import { ItwJwtCredentialStatus } from '../utils/itwTypesUtils';

const defaultLifecycleStatus: ItwJwtCredentialStatus[] = [
  'valid',
  'jwtExpiring',
  'jwtExpired'
];

type Props = {
  /**
   * The pid statuses that will render the alert.
   */
  lifecycleStatus?: ItwJwtCredentialStatus[];
  navigation: ReturnType<
    typeof useNavigation<StackNavigationProp<MainNavigatorParamsList>>
  >;
};

/**
 * This component renders an alert that displays information on the pid status.
 */
export const ItwPidLifecycleAlert = ({
  lifecycleStatus = defaultLifecycleStatus,
  navigation
}: Props) => {
  const pid = useAppSelector(itwCredentialsPidSelector);
  const maybePidStatus = useAppSelector(itwCredentialsPidStatusSelector);

  const startPidReissuing = () => {
    navigation.navigate(MAIN_ROUTES.WALLET_NAV, {
      screen: WALLET_ROUTES.PID_ISSUANCE.INSTANCE_CREATION
    });
  };

  if (!pid || !maybePidStatus || !lifecycleStatus.includes(maybePidStatus)) {
    return null;
  }

  const nameSpace = 'itw';
  const pidAlertPropsMap: Record<
    ItwJwtCredentialStatus,
    ComponentProps<typeof Alert>
  > = {
    jwtExpired: {
      action: t(`presentation.bottomSheets.pidInfo.alert.${nameSpace}.action`, {
        ns: 'wallet'
      }),
      content: t(
        `presentation.bottomSheets.pidInfo.alert.${nameSpace}.expired`,
        {
          ns: 'wallet'
        }
      ),
      onPress: startPidReissuing,
      testID: 'itwPidLifecycleAlertTestID_jwtExpired',
      variant: 'error'
    },
    jwtExpiring: {
      action: t(`presentation.bottomSheets.pidInfo.alert.${nameSpace}.action`, {
        ns: 'wallet'
      }),
      content: t(
        `presentation.bottomSheets.pidInfo.alert.${nameSpace}.expiring`,
        {
          date: format(pid.expiration, 'DD-MM-YYYY'),
          ns: 'wallet'
        }
      ),
      onPress: startPidReissuing,
      testID: 'itwPidLifecycleAlertTestID_jwtExpiring',
      variant: 'warning'
    },
    valid: {
      content: t(`presentation.bottomSheets.pidInfo.alert.${nameSpace}.valid`, {
        date: pid.issuedAt ? format(pid.issuedAt, 'DD-MM-YYYY') : '-',
        ns: 'wallet'
      }),
      testID: 'itwPidLifecycleAlertTestID_valid',
      variant: 'success'
    }
  };

  return (
    <View style={{ marginBottom: 16 }} testID="itwPidLifecycleAlertTestID">
      <Alert {...pidAlertPropsMap[maybePidStatus]} />
    </View>
  );
};
