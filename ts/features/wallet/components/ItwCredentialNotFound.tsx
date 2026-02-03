import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useEffect } from 'react';
import { t } from 'i18next';
import { OperationResultScreenContent } from '../../../components/screens/OperationResultScreenContent';
import { useDisableGestureNavigation } from '../../../hooks/useDisableGestureNavigation';
import { useHardwareBackButton } from '../../../hooks/useHardwareBackButton';
import { MainNavigatorParamsList } from '../../../navigation/main/MainStackNavigator';
import MAIN_ROUTES from '../../../navigation/main/routes';
import { useAppDispatch, useAppSelector } from '../../../store';
import { useCredentialIssuanceNavigationListeners } from '../hooks/useCredentialIssuanceNavigationListeners';
import WALLET_ROUTES from '../navigation/routes';
import { setCredentialIssuancePreAuthRequest } from '../store/credentialIssuance';
import { lifecycleIsValidSelector } from '../store/lifecycle';
import { setPendingCredential } from '../store/pidIssuance';

const ItwCredentialNotFound = ({
  credentialType
}: {
  credentialType: string;
}) => {
  const navigation =
    useNavigation<StackNavigationProp<MainNavigatorParamsList>>();
  const dispatch = useAppDispatch();

  // Disable the back gesture navigation and the hardware back button
  useDisableGestureNavigation();
  useHardwareBackButton(() => true);

  const shouldIssuePidFirst = useAppSelector(lifecycleIsValidSelector);
  useCredentialIssuanceNavigationListeners();

  const navigateToCredential = () => {
    if (shouldIssuePidFirst) {
      dispatch(setPendingCredential({ credential: credentialType }));
      navigation.navigate(MAIN_ROUTES.WALLET_NAV, {
        screen: WALLET_ROUTES.PID_ISSUANCE.INSTANCE_CREATION
      });
      return;
    }
    dispatch(
      setCredentialIssuancePreAuthRequest({ credential: credentialType })
    );
  };

  const handleClose = () => {
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
      pictogram="cie"
      title={t('issuance.credentialNotFound.title', { ns: 'wallet' })}
      subtitle={t('issuance.credentialNotFound.subtitle', {
        ns: 'wallet'
      })}
      isHeaderVisible={false}
      action={{
        label: t('buttons.continue', { ns: 'global' }),
        accessibilityLabel: t('buttons.continue', { ns: 'global' }),
        onPress: navigateToCredential
      }}
      secondaryAction={{
        label: t('buttons.cancel', { ns: 'global' }),
        accessibilityLabel: t('buttons.cancel', { ns: 'global' }),
        onPress: handleClose
      }}
    />
  );
};

export default ItwCredentialNotFound;
