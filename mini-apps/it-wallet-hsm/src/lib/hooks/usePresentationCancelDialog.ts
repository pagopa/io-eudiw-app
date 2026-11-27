import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

/**
 * Hook which exposes a method to show the dialog asking the user to confirm the cancellation of the presentation.
 * @param onCancel - Called when the user confirms the cancellation
 * @returns a function that shows the dialog
 */
export const usePresentationCancelDialog = (onCancel: () => void) => {
  const { t } = useTranslation('hsm');

  return () =>
    Alert.alert(
      t('presentation.cancelDialog.title'),
      t('presentation.cancelDialog.body'),
      [
        {
          onPress: onCancel,
          style: 'destructive',
          text: t('presentation.cancelDialog.confirm')
        },
        {
          style: 'cancel',
          text: t('presentation.cancelDialog.cancel')
        }
      ]
    );
};
