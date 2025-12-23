import I18n from 'i18next';
import {Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useHardwareBackButton} from '../../../hooks/useHardwareBackButton.tsx';

type ItwDismissalDialogProps = {
  handleDismiss?: () => void;
  customLabels?: {
    title?: string;
    body?: string;
    confirmLabel?: string;
    cancelLabel?: string;
  };
};

/**
 * Allows to show a dismissal dialog in which the user must confirm the desire to close the current flow.
 * This hook also handles the hardware back button to show the dialog when the user presses the back button.
 * @param handleDismiss - An optionalfunction that will be called when the user confirms the dismissal.
 * @param dismissalContext - An optional dismissal context to be used for analytics tracking.
 * @param customLabels - Optional object to override the default title, message, confirm button label, and cancel button label.
 * @returns a function that can be used to show the dialog
 */
export const useItwDismissalDialog = ({
  handleDismiss,
  customLabels = {}
}: ItwDismissalDialogProps = {}) => {
  const navigation = useNavigation();

  const title =
    customLabels.title ?? I18n.t('generics.alert.title', {ns: 'global'});
  const body =
    customLabels.body ?? I18n.t('generics.alert.body', {ns: 'global'});
  const confirmLabel =
    customLabels.confirmLabel ??
    I18n.t('generics.alert.confirm', {ns: 'global'});
  const cancelLabel =
    customLabels.cancelLabel ?? I18n.t('generics.alert.cancel', {ns: 'global'});

  const show = () => {
    Alert.alert(title, body, [
      {
        text: cancelLabel,
        style: 'cancel'
      },
      {
        text: confirmLabel,
        style: 'destructive',
        onPress: () => {
          (handleDismiss || navigation.goBack)();
        }
      }
    ]);
  };

  useHardwareBackButton(() => {
    show();
    return true;
  });

  return {show};
};
