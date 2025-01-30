import {useNavigation} from '@react-navigation/native';

export const useNavigateToWalletWithReset = () => {
  const navigation = useNavigation();

  const navigateToWallet = () =>
    navigation.reset({
      index: 0,
      routes: [{name: 'MAIN_TAB_NAV'}]
    });

  return {navigateToWallet};
};
