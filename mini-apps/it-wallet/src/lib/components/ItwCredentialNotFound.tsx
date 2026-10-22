import {
  OperationResultScreenContent,
  useDisableGestureNavigation,
  useHardwareBackButton
} from '@io-eudiw-app/commons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { t } from 'i18next';
import { useEffect } from 'react';

import CREDENTIAL_ISSUANCE_ROUTES from '../navigation/credentialIssuance/routes';
import { MainNavigatorParamsList } from '../navigation/main/MainStackNavigator';
import MAIN_ROUTES from '../navigation/main/routes';
import PID_ISSUANCE_ROUTES from '../navigation/pidIssuance/routes';
import { useAppDispatch, useAppSelector } from '../store';
import { setCredentialIssuancePreAuthRequest } from '../store/credentialIssuance';
import { lifecycleIsOperationalSelector } from '../store/lifecycle';
import { setPendingCredential } from '../store/pidIssuance';
import { wellKnownCredentialConfigurationIDs } from '../utils/credentials';

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

  const shouldIssuePidFirst = useAppSelector(lifecycleIsOperationalSelector);

  const navigateToCredential = () => {
    onDismiss?.();
    if (shouldIssuePidFirst) {
      const isPidOnlyFlow =
        credentialType === wellKnownCredentialConfigurationIDs.PID;
      dispatch(
        setPendingCredential({
          credential: isPidOnlyFlow ? undefined : credentialType
        })
      );
      navigation.navigate(MAIN_ROUTES.PID_ISSUANCE_NAV, {
        screen: PID_ISSUANCE_ROUTES.INSTANCE_CREATION
      });
      return;
    }
    dispatch(
      setCredentialIssuancePreAuthRequest({ credential: credentialType })
    );
    navigation.navigate(MAIN_ROUTES.CREDENTIAL_ISSUANCE_NAV, {
      screen: CREDENTIAL_ISSUANCE_ROUTES.TRUST
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
      subtitle={t('issuance.credentialNotFound.subtitle', { ns: 'wallet' })}
      title={t('issuance.credentialNotFound.title', { ns: 'wallet' })}
    />
  );
};

export default ItwCredentialNotFound;
