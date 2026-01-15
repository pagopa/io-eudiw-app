import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector } from '../../../store';
import { selectCredentialIssuancePreAuthStatus } from '../store/credentialIssuance';
import { lifecycleIsOperationalSelector } from '../store/lifecycle';
import { MainNavigatorParamsList } from '../../../navigation/main/MainStackNavigator';

/**
 * Hook that listens through the {@link useEffect} hook for credential issuance
 * status updates and redirects navigation accordingly
 */
export const useCredentialIssuanceNavigationListeners = () => {
  const preAuthStatus = useAppSelector(selectCredentialIssuancePreAuthStatus);
  const shouldIssuePidFirst = useAppSelector(lifecycleIsOperationalSelector);
  const navigation =
    useNavigation<StackNavigationProp<MainNavigatorParamsList>>();
  /**
   * If the pre auth request is successful, navigate to the trust screen
   * where the user will be requested to confirm the presentation of the required credentials and claims
   * to obtain the requested credential.
   */
  useEffect(() => {
    if (preAuthStatus.success.status && !shouldIssuePidFirst) {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'CREDENTIAL_ISSUANCE_TRUST'
      });
    }
  }, [preAuthStatus.success, navigation, shouldIssuePidFirst]);

  /**
   * If an error occurs during the pre auth request, navigate to the failure screen.
   */
  useEffect(() => {
    if (preAuthStatus.error.status && !shouldIssuePidFirst) {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'CREDENTIAL_ISSUANCE_FAILURE'
      });
    }
  }, [preAuthStatus.error, navigation, shouldIssuePidFirst]);
};
