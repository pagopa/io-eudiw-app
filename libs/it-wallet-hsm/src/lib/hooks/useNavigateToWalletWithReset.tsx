import { useNavigation } from '@react-navigation/native';

/**
 * Hook which exposes a method to navigate to the wallet screen and reset the navigation stack.
 */
export const useNavigateToWalletWithReset = () => {
  const navigation = useNavigation();

  const navigateToWallet = () =>
    navigation.reset({
      index: 0,
      routes: [{ name: 'MAIN_TAB_NAV' }]
    });

  return { navigateToWallet };
};
