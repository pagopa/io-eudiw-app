import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainNavigatorParamsList } from '../navigation/main/MainStackNavigator';
import WALLET_ROUTES from '../navigation/wallet/routes';
import MAIN_ROUTES from '../navigation/main/routes';
import { ItwCredentialWalletCard } from './credential/ItwCredentialWalletCard';
import { useAppSelector } from '../store';
import { itwCredentialsPidStatusSelector } from '../store/credentials';
import { wellKnownCredential } from '../utils/credentials';

export const ItwWalletIdCard = ({ isStacked }: { isStacked: boolean }) => {
  const navigation =
    useNavigation<StackNavigationProp<MainNavigatorParamsList>>();
  const pidStatus = useAppSelector(itwCredentialsPidStatusSelector);

  const handlePress = useCallback(() => {
    navigation.navigate(MAIN_ROUTES.WALLET_NAV, {
      screen: WALLET_ROUTES.PRESENTATION.PID_DETAIL
    });
  }, [navigation]);

  return (
    <ItwCredentialWalletCard
      isStacked={isStacked}
      cardProps={{
        credentialType: wellKnownCredential.PID,
        credentialStatus: pidStatus,
        onPress: handlePress
      }}
    />
  );
};
