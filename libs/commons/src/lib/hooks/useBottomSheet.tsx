import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetScrollView,
  useBottomSheetModal
} from '@gorhom/bottom-sheet';
import {
  IOBottomSheetHeaderRadius,
  IOColors,
  IOVisualCostants,
  VSpacer
} from '@pagopa/io-app-design-system';
import { useCallback, useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheetHeader } from '../components/BottomSheetHeader';
import { NonEmptyArray } from '../types/utils';
import { useHardwareBackButtonToDismiss } from './useHardwareBackButton';

const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  bottomSheet: {
    borderCurve: 'continuous',
    borderTopLeftRadius: IOBottomSheetHeaderRadius,
    borderTopRightRadius: IOBottomSheetHeaderRadius,
    // Don't delete the overflow property
    // oterwise the above borderRadius won't work
    overflow: 'hidden'
  }
});

type BottomSheetOptions = {
  closeAccessibilityLabel: string;
  component: React.ReactNode;
  footer?: React.ReactElement;
  fullScreen?: boolean;
  maxDynamicContentSizePercent?: number;
  onDismiss?: () => void;
  snapPoint?: NonEmptyArray<number | string>;
  title: React.ReactNode | string;
};

type IOBottomSheetModal = {
  bottomSheet: React.JSX.Element;
  dismiss: () => void;
  present: () => void;
};

/**
 * Hook to generate a bottomSheet with a title, snapPoint and a component, in order to wrap the invocation of bottomSheetContent
 * @param component - React component to be rendered inside the bottom sheet body
 * @param title -  String or React component to be rendered as bottom-sheet header title
 * @param snapPoint -  Optional array of points used to pin the height of the bottom sheet. If that's not provided then the bottom sheet automatically adjust its height based on the content
 * @param footer - Optional React component to be rendered as sticky footer of our bottom sheet
 * @param fullScreen - Optional flag to set the bottom sheet as full screen
 * @param onDismiss - Optional callback function to be called when the bottom sheet is dismissed
 */
export const useIOBottomSheetModal = ({
  closeAccessibilityLabel,
  component,
  footer,
  maxDynamicContentSizePercent = 1,
  onDismiss,
  snapPoint,
  title
}: Omit<BottomSheetOptions, 'fullScreen'>): IOBottomSheetModal => {
  const insets = useSafeAreaInsets();
  const { dismissAll } = useBottomSheetModal();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { onClose, onOpen } = useHardwareBackButtonToDismiss(dismissAll);

  const header = (
    <BottomSheetHeader
      closeAccessibilityLabel={closeAccessibilityLabel}
      onClose={dismissAll}
      title={title}
    />
  );
  const bottomSheetContent = (
    <BottomSheetScrollView
      overScrollMode={'never'}
      style={{
        paddingHorizontal: IOVisualCostants.appMarginDefault
      }}
    >
      {component}
      {footer ? (
        <>
          <VSpacer size={48} />
          <VSpacer size={48} />
        </>
      ) : (
        <View style={{ height: insets.bottom }} />
      )}
    </BottomSheetScrollView>
  );

  const handleDismiss = () => {
    onDismiss?.();
    onClose();
  };

  const present = () => {
    bottomSheetModalRef.current?.present();
    onOpen();
  };

  // // Add opacity fade effect to backdrop
  const BackdropElement = useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...backdropProps}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.2}
      />
    ),
    []
  );

  const bottomSheet = (
    <BottomSheetModal
      accessible={false}
      backdropComponent={BackdropElement}
      enableDismissOnClose={true}
      enableDynamicSizing={snapPoint ? false : true}
      footerComponent={(props: BottomSheetFooterProps) =>
        footer ? (
          <BottomSheetFooter
            {...props}
            // bottomInset={insets.bottom}
            style={{
              backgroundColor: IOColors.white,
              paddingBottom: insets.bottom
            }}
          >
            {footer}
          </BottomSheetFooter>
        ) : null
      }
      handleComponent={_ => header}
      importantForAccessibility={'yes'}
      maxDynamicContentSize={
        (screenHeight - insets.top) *
        Math.min(Math.max(maxDynamicContentSizePercent, 0.25), 1)
      }
      onDismiss={handleDismiss}
      ref={bottomSheetModalRef}
      snapPoints={snapPoint}
      style={styles.bottomSheet}
    >
      {bottomSheetContent}
    </BottomSheetModal>
  );
  return { bottomSheet, dismiss: dismissAll, present };
};
