import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCallback } from 'react';

import { MainNavigatorParamsList } from '../navigation/main/MainStackNavigator';
import MAIN_ROUTES from '../navigation/main/routes';
import WALLET_ROUTES from '../navigation/wallet/routes';
import { useAppSelector } from '../store';
import { itwCredentialsPidStatusSelector } from '../store/credentials';
import { selectIsRemoteKeyLocked } from '../store/instance';
import { wellKnownCredential } from '../utils/credentials';
import { ItwCredentialWalletCard } from './credential/ItwCredentialWalletCard';

export const ItwWalletIdCard = ({ isStacked }: { isStacked: boolean }) => {
  const navigation =
    useNavigation<StackNavigationProp<MainNavigatorParamsList>>();
  const pidStatus = useAppSelector(itwCredentialsPidStatusSelector);
  // A PID bound to a locked Remote WSCD key cannot be presented until the identity is confirmed again
  const isRemoteKeyLocked = useAppSelector(selectIsRemoteKeyLocked);

  const handlePress = useCallback(() => {
    navigation.navigate(MAIN_ROUTES.WALLET_NAV, {
      params: {
        credentialType: wellKnownCredential.PID
      },
      screen: WALLET_ROUTES.PRESENTATION.CREDENTIAL_DETAILS
    });
  }, [navigation]);

  return (
    <ItwCredentialWalletCard
      cardProps={{
        credentialStatus: isRemoteKeyLocked ? 'unknown' : pidStatus,
        credentialType: wellKnownCredential.PID,
        onPress: handlePress
      }}
      isStacked={isStacked}
    />
  );
};
