import * as React from 'react';
import {View, StyleSheet} from 'react-native';
import {
  H4,
  IconButton,
  IOColors,
  IOStyles,
  IOVisualCostants
} from '@pagopa/io-app-design-system';
import {useTranslation} from 'react-i18next';

const styles = StyleSheet.create({
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    paddingTop: IOVisualCostants.appMarginDefault,
    paddingBottom: IOVisualCostants.appMarginDefault,
    backgroundColor: IOColors.white
  }
});

type Props = {
  title: string | React.ReactNode;
  onClose: () => void;
};

/**
 * Header for the bottom sheet exposed by the {@link useBottomSheet.tsx} hook. It renders a title and a close button.
 * @param title - The title of the bottom sheet.
 * @param onClose - The function to call when the close button is pressed.
 */
export const BottomSheetHeader: React.FunctionComponent<Props> = ({
  title,
  onClose
}: Props) => {
  const headerRef = React.createRef<View>();
  const {t} = useTranslation('global');

  return (
    <View style={styles.bottomSheetHeader} ref={headerRef}>
      {React.isValidElement(title) ? (
        title
      ) : (
        <View
          style={IOStyles.flex}
          accessible={true}
          accessibilityRole={'header'}
          accessibilityLabel={typeof title === 'string' ? title : undefined}>
          <H4>{title}</H4>
        </View>
      )}
      <IconButton
        color="neutral"
        onPress={onClose}
        icon="closeMedium"
        accessibilityLabel={t('buttons.close')}
      />
    </View>
  );
};
