import { NavigationContext } from '@react-navigation/native';
import { useContext, useEffect, useState } from 'react';

/**
 * Returns a key that changes every time the closest screen regains focus.
 *
 * Skia's Canvas can fail to paint its first frame when it mounts while the
 * screen is mid-transition. Using this key on the Canvas forces a fresh
 * surface when coming back to the screen. The key does not change on blur, so
 * the Canvas is not remounted (and does not blank) while navigating away.
 *
 * It is safe to use outside of a navigator (e.g. in unit tests), where the key
 * never changes.
 */
export const useFocusRemountKey = (): number => {
  const navigation = useContext(NavigationContext);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!navigation) {
      return undefined;
    }
    // The first focus event is the initial mount, which needs no remount
    let hasBeenBlurred = false;
    const unsubscribeBlur = navigation.addListener('blur', () => {
      hasBeenBlurred = true;
    });
    const unsubscribeFocus = navigation.addListener('focus', () => {
      if (hasBeenBlurred) {
        setKey(k => k + 1);
      }
    });
    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [navigation]);

  return key;
};
