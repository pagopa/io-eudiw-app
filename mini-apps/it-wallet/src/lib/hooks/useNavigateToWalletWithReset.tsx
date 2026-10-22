import { StackActions, useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';

import MAIN_ROUTES from '../navigation/main/routes';

/**
 * Hook which exposes a method to go back to the wallet home, removing every
 * screen above it.
 * It pops back to the existing tab navigator so the home is not remounted and
 * the transition is animated as a back navigation. The action bubbles up from
 * the nested flow stacks to the main stack. If the home is not in the stack
 * (e.g. the app was opened from a deep link) the current screen is replaced
 * with it.
 */
export const useNavigateToWalletWithReset = () => {
  const navigation = useNavigation();

  const navigateToWallet = useCallback(
    () => navigation.dispatch(StackActions.popTo(MAIN_ROUTES.TAB_NAV)),
    [navigation]
  );

  return { navigateToWallet };
};
