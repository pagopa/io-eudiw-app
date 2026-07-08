import { useNavigation } from '@react-navigation/native';
import WALLET_ROUTES from '../../navigation/wallet/routes';
import { withWalletCardBaseComponent } from '../WalletCardBaseComponent';
import { WalletCardPressableBase } from '../WalletCardPressableBase';
import { ItwCredentialCard } from './ItwCredentialCard';
import MAIN_ROUTES from '../../navigation/main/routes';

type ItwCredentialWalletCardProps = ItwCredentialCard & {
  /* Optional onPress to override press functionality */
  onPress?: () => void;
};

const WrappedItwCredentialCard = (props: ItwCredentialWalletCardProps) => {
  const { credentialType, onPress } = props;
  const navigation = useNavigation();

  const handleOnPress = () => {
    navigation.navigate(MAIN_ROUTES.WALLET_NAV, {
      screen: WALLET_ROUTES.PRESENTATION.CREDENTIAL_DETAILS,
      params: {
        credentialType
      }
    });
  };

  return (
    <WalletCardPressableBase
      onPress={onPress ?? handleOnPress}
      testID="ItwCredentialWalletCardTestID"
    >
      <ItwCredentialCard {...props} />
    </WalletCardPressableBase>
  );
};

/**
 * Wrapper component which adds wallet capabilites to the ItwCredentialCard component
 */
export const ItwCredentialWalletCard = withWalletCardBaseComponent(
  WrappedItwCredentialCard
);
