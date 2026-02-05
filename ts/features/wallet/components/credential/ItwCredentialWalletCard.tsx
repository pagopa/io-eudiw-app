import { useNavigation } from '@react-navigation/native';
import MAIN_ROUTES from '../../../../navigation/main/routes';
import WALLET_ROUTES from '../../navigation/routes';
import { withWalletCardBaseComponent } from '../WalletCardBaseComponent';
import { WalletCardPressableBase } from '../WalletCardPressableBase';
import { ItwCredentialCard } from './ItwCredentialCard';

export type ItwCredentialWalletCardProps = ItwCredentialCard & {
  isPreview?: false; // Cards in wallet cannot be in preview mode
};

const WrappedItwCredentialCard = (props: ItwCredentialWalletCardProps) => {
  const { credentialType } = props;
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
      onPress={handleOnPress}
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
