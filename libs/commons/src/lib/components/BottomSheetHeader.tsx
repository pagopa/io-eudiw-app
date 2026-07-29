import {
  H4,
  IconButton,
  IOColors,
  IOVisualCostants
} from '@pagopa/io-app-design-system';
import { createRef, isValidElement } from 'react';
import { StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
  bottomSheetHeader: {
    alignItems: 'center',
    backgroundColor: IOColors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: IOVisualCostants.appMarginDefault,
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    paddingTop: IOVisualCostants.appMarginDefault
  },
  bottomSheetHeaderContent: {
    flex: 1
  }
});

type Props = {
  closeAccessibilityLabel: string;
  onClose: () => void;
  title: React.ReactNode | string;
};

/**
 * Header for the bottom sheet exposed by the {@link useBottomSheet.tsx} hook. It renders a title and a close button.
 * @param title - The title of the bottom sheet.
 * @param onClose - The function to call when the close button is pressed.
 */
export const BottomSheetHeader: React.FunctionComponent<Props> = ({
  closeAccessibilityLabel,
  onClose,
  title
}: Props) => {
  const headerRef = createRef<View>();

  return (
    <View ref={headerRef} style={styles.bottomSheetHeader}>
      {isValidElement(title) ? (
        title
      ) : (
        <View
          accessibilityLabel={typeof title === 'string' ? title : undefined}
          accessibilityRole={'header'}
          accessible={true}
          style={styles.bottomSheetHeaderContent}
        >
          <H4>{title}</H4>
        </View>
      )}
      <IconButton
        accessibilityLabel={closeAccessibilityLabel}
        color="neutral"
        icon="closeMedium"
        onPress={onClose}
      />
    </View>
  );
};
