import { useHardwareBackButton } from '@io-eudiw-app/commons';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';

type ItwDismissalDialogProps = {
  customLabels: {
    body: string;
    cancelLabel: string;
    confirmLabel: string;
    title: string;
  };
  handleDismiss?: () => void;
};

/**
 * Allows to show a dismissal dialog in which the user must confirm the desire to close the current flow.
 * This hook also handles the hardware back button to show the dialog when the user presses the back button.
 * @param handleDismiss - An optional function that will be called when the user confirms the dismissal.
 * @param dismissalContext - An optional dismissal context to be used for analytics tracking.
 * @param customLabels - Optional object to override the default title, message, confirm button label, and cancel button label.
 * @returns a function that can be used to show the dialog
 */
export const useItwDismissalDialog = ({
  customLabels,
  handleDismiss
}: ItwDismissalDialogProps) => {
  const navigation = useNavigation();

  const { body, cancelLabel, confirmLabel, title } = customLabels;

  const show = () => {
    Alert.alert(title, body, [
      {
        style: 'cancel',
        text: cancelLabel
      },
      {
        onPress: () => {
          (handleDismiss || navigation.goBack)();
        },
        style: 'destructive',
        text: confirmLabel
      }
    ]);
  };

  useHardwareBackButton(() => {
    show();
    return true;
  });

  return { show };
};
