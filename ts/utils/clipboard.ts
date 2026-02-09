import { IOToast } from '@pagopa/io-app-design-system';
import * as Clipboard from 'expo-clipboard';
import { t } from 'i18next';

/**
 * Copy a text to the device clipboard and give a feedback.
 */
export const clipboardSetStringWithFeedback = async (text: string) => {
  await Clipboard.setStringAsync(text);

  IOToast.success(t('clipboard.copyFeedback', { ns: 'global' }));
};
