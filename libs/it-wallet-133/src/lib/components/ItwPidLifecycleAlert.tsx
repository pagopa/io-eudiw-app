import { Alert } from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { format } from 'date-fns';
import { t } from 'i18next';
import { View } from 'react-native';
import { itwCredentialsPidSelector } from '../store/credentials';
import {
  ItwJwtCredentialStatus,
  StoredCredential
} from '../utils/itwTypesUtils';
import { useAppSelector } from '../store';
import { MainNavigatorParamsList } from '../navigation/main/MainStackNavigator';

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

  const Content = ({ pidCredential }: { pidCredential: StoredCredential }) => {
    const nameSpace = 'itw';

    return (
      <View style={{ marginBottom: 16 }} testID={`itwPidLifecycleAlertTestID`}>
        <Alert
          testID="itwPidLifecycleAlertTestID_valid"
          variant="success"
          content={t(
            `presentation.bottomSheets.pidInfo.alert.${nameSpace}.valid`,
            {
              date: pidCredential.issuedAt
                ? format(pidCredential.issuedAt, 'DD-MM-YYYY')
                : '-',
              ns: 'wallet'
            }
          )}
        />
      </View>
    );
  };

  return pid && <Content pidCredential={pid} />;
};
