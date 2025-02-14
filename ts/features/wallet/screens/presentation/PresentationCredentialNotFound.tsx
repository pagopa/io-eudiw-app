import React, {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {OperationResultScreenContent} from '../../../../components/screens/OperationResultScreenContent';
import {useHardwareBackButton} from '../../../../hooks/useHardwareBackButton';
import {useDisableGestureNavigation} from '../../../../hooks/useDisableGestureNavigation';
import {wellKnownCredential} from '../../utils/credentials';
import MAIN_ROUTES from '../../../../navigation/main/routes';

/**
 * Component to be rendered as fallback when a credential is not found and the user tries to open its details.
 * This should be possible as only credentials present in the store are rendered, however it's still used as a fallback.
 * If the credential doesn't exists, the user can request it by opening the issuance flow.
 */
const PresentationCredentialNotFound = ({
  credentialType
}: {
  credentialType: string;
}) => {
  const navigation = useNavigation();
  const {t} = useTranslation(['global', 'wallet']);

  // Disable the back gesture navigation and the hardware back button
  useDisableGestureNavigation();
  useHardwareBackButton(() => true);

  const handleClose = () => {
    navigation.goBack();
  };

  // Since this component could be used on a screen where the header is visible, we hide it.
  useEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
  }, [navigation]);

  const navigateToObtainCredential = () => {
    if (credentialType !== wellKnownCredential.PID) {
      navigation.navigate(MAIN_ROUTES.WALLET_NAV, {
        screen: 'PID_ISSUANCE_INSTANCE_CREATION'
      });
    }
  };

  return (
    <OperationResultScreenContent
      pictogram="cie"
      title={t('wallet:presentation.credentialNotFound.title')}
      subtitle={t('wallet:presentation.credentialNotFound.subtitle')}
      isHeaderVisible={false}
      action={{
        label: t('global:buttons.continue'),
        accessibilityLabel: t('global:buttons.continue'),
        onPress: navigateToObtainCredential
      }}
      secondaryAction={{
        label: t('global:buttons.cancel'),
        accessibilityLabel: t('global:buttons.cancel'),
        onPress: handleClose
      }}
    />
  );
};

export default PresentationCredentialNotFound;
