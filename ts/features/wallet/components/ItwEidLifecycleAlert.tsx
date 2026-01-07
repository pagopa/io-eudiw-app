import { Alert } from '@pagopa/io-app-design-system';
import { format } from 'date-fns';
import { ComponentProps, useMemo } from 'react';
import { View } from 'react-native';
import I18n from 'i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ItwJwtCredentialStatus } from '../utils/itwTypesUtils';
import { StoredCredential } from '../utils/types';
import { useAppSelector } from '../../../store';
import {
  itwCredentialsEidSelector,
  itwCredentialsEidStatusSelector
} from '../store/credentials';
import WALLET_ROUTES from '../navigation/routes';
import MAIN_ROUTES from '../../../navigation/main/routes';
import { MainNavigatorParamsList } from '../../../navigation/main/MainStackNavigator';

const defaultLifecycleStatus: Array<ItwJwtCredentialStatus> = [
  'valid',
  'jwtExpiring',
  'jwtExpired'
];

type Props = {
  /**
   * The eID statuses that will render the alert.
   */
  lifecycleStatus?: Array<ItwJwtCredentialStatus>;
  navigation: ReturnType<
    typeof useNavigation<StackNavigationProp<MainNavigatorParamsList>>
  >;
};

/**
 * This component renders an alert that displays information on the eID status.
 */
export const ItwEidLifecycleAlert = ({
  lifecycleStatus = defaultLifecycleStatus,
  navigation
}: Props) => {
  const eid = useAppSelector(itwCredentialsEidSelector);
  const maybeEidStatus = useAppSelector(itwCredentialsEidStatusSelector);

  const startEidReissuing = () => {
    navigation.navigate(MAIN_ROUTES.WALLET_NAV, {
      screen: WALLET_ROUTES.PID_ISSUANCE.INSTANCE_CREATION
    });
  };

  const Content = ({
    eidCredential,
    eidStatus
  }: {
    eidCredential: StoredCredential;
    eidStatus: ItwJwtCredentialStatus;
  }) => {
    const nameSpace = 'itw';

    const alertProps = useMemo<ComponentProps<typeof Alert>>(() => {
      const eIDAlertPropsMap: Record<
        ItwJwtCredentialStatus,
        ComponentProps<typeof Alert>
      > = {
        valid: {
          testID: 'itwEidLifecycleAlertTestID_valid',
          variant: 'success',
          content: I18n.t(
            `presentation.bottomSheets.eidInfo.alert.${nameSpace}.valid`,
            {
              date: eidCredential.issuedAt
                ? format(eidCredential.issuedAt, 'dd-MM-yyyy')
                : '-',
              ns: 'wallet'
            }
          )
        },
        jwtExpiring: {
          testID: 'itwEidLifecycleAlertTestID_jwtExpiring',
          variant: 'warning',
          content: I18n.t(
            `presentation.bottomSheets.eidInfo.alert.${nameSpace}.expiring`,
            // TODO [SIW-3225]: date in bold
            {
              date: format(eidCredential.expiration, 'dd-MM-yyyy'),
              ns: 'wallet'
            }
          ),
          action: I18n.t(
            `presentation.bottomSheets.eidInfo.alert.${nameSpace}.action`,
            {
              ns: 'wallet'
            }
          ),
          onPress: startEidReissuing
        },
        jwtExpired: {
          testID: 'itwEidLifecycleAlertTestID_jwtExpired',
          variant: 'error',
          content: I18n.t(
            `presentation.bottomSheets.eidInfo.alert.${nameSpace}.expired`,
            {
              ns: 'wallet'
            }
          ),
          action: I18n.t(
            `presentation.bottomSheets.eidInfo.alert.${nameSpace}.action`,
            { ns: 'wallet' }
          ),
          onPress: startEidReissuing
        }
      };

      return eIDAlertPropsMap[eidStatus];
    }, [
      eidStatus,
      eidCredential.issuedAt,
      eidCredential.expiration,
      nameSpace
    ]);

    if (!lifecycleStatus.includes(eidStatus)) {
      return null;
    }

    return (
      <View style={{ marginBottom: 16 }} testID={`itwEidLifecycleAlertTestID`}>
        <Alert {...alertProps} />
      </View>
    );
  };

  return (
    eid &&
    maybeEidStatus && <Content eidCredential={eid} eidStatus={maybeEidStatus} />
  );
};
