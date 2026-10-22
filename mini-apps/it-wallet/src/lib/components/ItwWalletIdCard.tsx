import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCallback } from 'react';

import { MainNavigatorParamsList } from '../navigation/main/MainStackNavigator';
import MAIN_ROUTES from '../navigation/main/routes';
import { useAppSelector } from '../store';
import { itwCredentialsPidStatusSelector } from '../store/credentials';
import { wellKnownCredential } from '../utils/credentials';
import { ItwCredentialWalletCard } from './credential/ItwCredentialWalletCard';

export const ItwWalletIdCard = ({ isStacked }: { isStacked: boolean }) => {
  const navigation =
    useNavigation<StackNavigationProp<MainNavigatorParamsList>>();
  const pidStatus = useAppSelector(itwCredentialsPidStatusSelector);

  const handlePress = useCallback(() => {
    navigation.navigate(MAIN_ROUTES.CREDENTIAL_DETAILS, {
      credentialType: wellKnownCredential.PID
    });
  }, [navigation]);

  return (
    <ItwCredentialWalletCard
      cardProps={{
        credentialStatus: pidStatus,
        credentialType: wellKnownCredential.PID,
        onPress: handlePress
      }}
      isStacked={isStacked}
    />
  );
};
