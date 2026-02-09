import { Alert } from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { format } from 'date-fns';
import { ComponentProps, useMemo } from 'react';
import { View } from 'react-native';
import { t } from 'i18next';
import { MainNavigatorParamsList } from '../../../navigation/main/MainStackNavigator';
import MAIN_ROUTES from '../../../navigation/main/routes';
import { useAppSelector } from '../../../store';
import WALLET_ROUTES from '../navigation/routes';
import {
  itwCredentialsPidSelector,
  itwCredentialsPidStatusSelector
} from '../store/credentials';
import {
  ItwJwtCredentialStatus,
  StoredCredential
} from '../utils/itwTypesUtils';

const defaultLifecycleStatus: Array<ItwJwtCredentialStatus> = [
  'valid',
  'jwtExpiring',
  'jwtExpired'
];

type Props = {
  /**
   * The pid statuses that will render the alert.
   */
  lifecycleStatus?: Array<ItwJwtCredentialStatus>;
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

  const Content = ({
    pidCredential,
    pidStatus
  }: {
    pidCredential: StoredCredential;
    pidStatus: ItwJwtCredentialStatus;
  }) => {
    const nameSpace = 'itw';

    const alertProps = useMemo<ComponentProps<typeof Alert>>(() => {
      const pidAlertPropsMap: Record<
        ItwJwtCredentialStatus,
        ComponentProps<typeof Alert>
      > = {
        valid: {
          testID: 'itwPidLifecycleAlertTestID_valid',
          variant: 'success',
          content: t(
            `presentation.bottomSheets.pidInfo.alert.${nameSpace}.valid`,
            {
              date: pidCredential.issuedAt
                ? format(pidCredential.issuedAt, 'DD-MM-YYYY')
                : '-',
              ns: 'wallet'
            }
          )
        },
        jwtExpiring: {
          testID: 'itwPidLifecycleAlertTestID_jwtExpiring',
          variant: 'warning',
          content: t(
            `presentation.bottomSheets.pidInfo.alert.${nameSpace}.expiring`,
            // TODO [SIW-3225]: date in bold
            {
              date: format(pidCredential.expiration, 'DD-MM-YYYY'),
              ns: 'wallet'
            }
          ),
          action: t(
            `presentation.bottomSheets.pidInfo.alert.${nameSpace}.action`,
            {
              ns: 'wallet'
            }
          ),
          onPress: startPidReissuing
        },
        jwtExpired: {
          testID: 'itwPidLifecycleAlertTestID_jwtExpired',
          variant: 'error',
          content: t(
            `presentation.bottomSheets.pidInfo.alert.${nameSpace}.expired`,
            {
              ns: 'wallet'
            }
          ),
          action: t(
            `presentation.bottomSheets.pidInfo.alert.${nameSpace}.action`,
            { ns: 'wallet' }
          ),
          onPress: startPidReissuing
        }
      };

      return pidAlertPropsMap[pidStatus];
    }, [
      pidStatus,
      pidCredential.issuedAt,
      pidCredential.expiration,
      nameSpace
    ]);

    if (!lifecycleStatus.includes(pidStatus)) {
      return null;
    }

    return (
      <View style={{ marginBottom: 16 }} testID={`itwPidLifecycleAlertTestID`}>
        <Alert {...alertProps} />
      </View>
    );
  };

  return (
    pid &&
    maybePidStatus && <Content pidCredential={pid} pidStatus={maybePidStatus} />
  );
};
