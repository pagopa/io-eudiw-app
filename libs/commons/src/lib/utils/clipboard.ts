import { IOToast } from '@pagopa/io-app-design-system';
import * as Clipboard from 'expo-clipboard';

/**
 * Copy a text to the device clipboard and give a feedback.
 */
export const clipboardSetStringWithFeedback = async (
  text: string,
  successMessage: string
) => {
  await Clipboard.setStringAsync(text);
  IOToast.success(successMessage);
};
