import {
  OperationResultScreenContent,
  useDisableGestureNavigation,
  useHardwareBackButton
} from '@io-eudiw-app/commons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { t } from 'i18next';
import { useEffect } from 'react';

import { MainNavigatorParamsList } from '../navigation/main/MainStackNavigator';
import MAIN_ROUTES from '../navigation/main/routes';
import WALLET_ROUTES from '../navigation/wallet/routes';
import { useAppDispatch } from '../store';
import { setCredentialIssuancePreAuthRequest } from '../store/credentialIssuance';

const ItwCredentialNotFound = ({
  cancelButtonLabel,
  continueButtonLabel,
  credentialType,
  onDismiss
}: {
  cancelButtonLabel: string;
  continueButtonLabel: string;
  credentialType: string;
  onDismiss?: () => void;
}) => {
  const navigation =
    useNavigation<StackNavigationProp<MainNavigatorParamsList>>();
  const dispatch = useAppDispatch();

  // Disable the back gesture navigation and the hardware back button
  useDisableGestureNavigation();
  useHardwareBackButton(() => true);

  const navigateToCredential = () => {
    onDismiss?.();
    dispatch(
      setCredentialIssuancePreAuthRequest({ credential: credentialType })
    );
    navigation.navigate(MAIN_ROUTES.WALLET_NAV, {
      screen: WALLET_ROUTES.CREDENTIAL_ISSUANCE.TRUST
    });
  };

  const handleClose = () => {
    if (onDismiss) {
      onDismiss();
      return;
    }
    navigation.pop();
  };

  // Since this component could be used on a screen where the header is visible, we hide it.
  useEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
  }, [navigation]);

  return (
    <OperationResultScreenContent
      action={{
        accessibilityLabel: continueButtonLabel,
        label: continueButtonLabel,
        onPress: navigateToCredential
      }}
      isHeaderVisible={false}
      pictogram="cie"
      secondaryAction={{
        accessibilityLabel: cancelButtonLabel,
        label: cancelButtonLabel,
        onPress: handleClose
      }}
      subtitle={t('issuance.credentialNotFound.subtitle', {
        ns: 'itWalletHsm'
      })}
      title={t('issuance.credentialNotFound.title', { ns: 'itWalletHsm' })}
    />
  );
};

export default ItwCredentialNotFound;
