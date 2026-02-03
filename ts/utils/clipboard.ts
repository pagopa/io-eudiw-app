import { IOToast } from '@pagopa/io-app-design-system';
import Clipboard from '@react-native-clipboard/clipboard';
import { t } from 'i18next';

/**
 * Copy a text to the device clipboard and give a feedback.
 */
export const clipboardSetStringWithFeedback = (text: string) => {
  Clipboard.setString(text);

  IOToast.success(t('clipboard.copyFeedback', { ns: 'global' }));
};
