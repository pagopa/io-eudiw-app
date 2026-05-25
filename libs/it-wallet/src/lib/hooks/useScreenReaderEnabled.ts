import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export const useScreenReaderEnabled = () => {
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const syncScreenReaderState = async () => {
      const enabled = await AccessibilityInfo.isScreenReaderEnabled();

      if (isMounted) {
        setScreenReaderEnabled(enabled);
      }
    };

    void syncScreenReaderState();

    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setScreenReaderEnabled
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return screenReaderEnabled;
};
