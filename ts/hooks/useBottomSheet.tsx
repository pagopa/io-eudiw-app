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
import * as React from 'react';
import {useCallback} from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {BottomSheetHeader} from '../components/BottomSheetHeader';
import {NonEmptyArray} from '../utils/types';
import {useHardwareBackButtonToDismiss} from './useHardwareBackButton';

const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  bottomSheet: {
    borderTopRightRadius: IOBottomSheetHeaderRadius,
    borderTopLeftRadius: IOBottomSheetHeaderRadius,
    borderCurve: 'continuous',
    // Don't delete the overflow property
    // oterwise the above borderRadius won't work
    overflow: 'hidden'
  }
});

export type IOBottomSheetModal = {
  present: () => void;
  dismiss: () => void;
  bottomSheet: JSX.Element;
};

/**
 * @typedef BottomSheetOptions
 * @type {BottomSheetOptions}
 * @property {component} component The React.Element to be rendered inside the bottom sheet body
 * @property {title} title String or React.Element to be rendered as bottom-sheet header title
 * @property {footer} footer React.Element or undefined to be rendered as sticky footer of our bottom sheet
 * @property {snapPoint} snapPoint The array of points used to pin the height of the bottom sheet
 * @property {onDismiss} onDismiss The possible function to be used as an effect of the dismissal of the bottom sheet
 */
type BottomSheetOptions = {
  component: React.ReactNode;
  title: string | React.ReactNode;
  snapPoint?: NonEmptyArray<number | string>;
  footer?: React.ReactElement;
  fullScreen?: boolean;
  onDismiss?: () => void;
};

/**
 * Hook to generate a bottomSheet with a title, snapPoint and a component, in order to wrap the invocation of bottomSheetContent
 * @param bottomSheetOptions
 * @see {BottomSheetOptions}
 */
export const useIOBottomSheetModal = ({
  component,
  title,
  snapPoint,
  footer,
  onDismiss
}: Omit<BottomSheetOptions, 'fullScreen'>): IOBottomSheetModal => {
  const insets = useSafeAreaInsets();
  const {dismissAll} = useBottomSheetModal();
  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);
  const {onOpen, onClose} = useHardwareBackButtonToDismiss(dismissAll);

  const header = <BottomSheetHeader title={title} onClose={dismissAll} />;
  const bottomSheetContent = (
    <BottomSheetScrollView
      style={{
        paddingHorizontal: IOVisualCostants.appMarginDefault
      }}
      overScrollMode={'never'}>
      {component}
      {footer ? (
        <>
          <VSpacer size={48} />
          <VSpacer size={48} />
        </>
      ) : (
        <View style={{height: insets.bottom}} />
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
        opacity={0.2}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    []
  );

  const bottomSheet = (
    <BottomSheetModal
      style={styles.bottomSheet}
      footerComponent={(props: BottomSheetFooterProps) =>
        footer ? (
          <BottomSheetFooter
            {...props}
            // bottomInset={insets.bottom}
            style={{
              paddingBottom: insets.bottom,
              backgroundColor: IOColors.white
            }}>
            {footer}
          </BottomSheetFooter>
        ) : null
      }
      enableDynamicSizing={snapPoint ? false : true}
      maxDynamicContentSize={screenHeight - insets.top}
      snapPoints={snapPoint}
      ref={bottomSheetModalRef}
      handleComponent={_ => header}
      backdropComponent={BackdropElement}
      enableDismissOnClose={true}
      accessible={false}
      importantForAccessibility={'yes'}
      onDismiss={handleDismiss}>
      {bottomSheetContent}
    </BottomSheetModal>
  );
  return {present, dismiss: dismissAll, bottomSheet};
};
