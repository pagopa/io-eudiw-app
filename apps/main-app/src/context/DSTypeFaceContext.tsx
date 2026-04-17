import { useIONewTypeface } from '@pagopa/io-app-design-system';
import { useLayoutEffect } from 'react';
import { useAppSelector } from '../store';
import { selectFontPreference } from '@io-eudiw-app/preferences';

export const FONT_PERSISTENCE_KEY = 'fontTypeface';

export const useStoredFontPreference = () => {
  const { setNewTypefaceEnabled } = useIONewTypeface();
  const fontPreference = useAppSelector(selectFontPreference);

  useLayoutEffect(() => {
    setNewTypefaceEnabled(
      fontPreference ? fontPreference === 'comfortable' : true
    );
  }, [setNewTypefaceEnabled, fontPreference]);
};
