import { NavigationContext } from '@react-navigation/native';
import { useCallback, useContext, useSyncExternalStore } from 'react';

/**
 * Navigation-safe variant of React Navigation's `useIsFocused`.
 *
 * Unlike `useIsFocused`, it does not throw when rendered outside of a navigator
 * (e.g. in unit tests or isolated playgrounds): in that case it simply reports
 * the screen as focused.
 *
 * @returns `true` when the closest screen is focused (or when there is no
 *   navigation context), `false` while it is blurred.
 */
export const useIsScreenFocused = (): boolean => {
  const navigation = useContext(NavigationContext);
  const subscribe = useCallback(
    (onChange: () => void) => {
      const unsubscribeFocus = navigation?.addListener('focus', onChange);
      const unsubscribeBlur = navigation?.addListener('blur', onChange);

      return () => {
        unsubscribeFocus?.();
        unsubscribeBlur?.();
      };
    },
    [navigation]
  );
  const getSnapshot = useCallback(
    () => navigation?.isFocused() ?? true,
    [navigation]
  );

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};
