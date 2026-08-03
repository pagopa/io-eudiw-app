import {
  Body,
  BodyProps,
  ComposedBodyFromArray,
  H3,
  IOButton,
  IOButtonProps,
  IOPictograms,
  IOVisualCostants,
  Pictogram,
  VSpacer,
  WithTestID
} from '@pagopa/io-app-design-system';
import {
  cloneElement,
  forwardRef,
  isValidElement,
  PropsWithChildren
} from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

type ButtonProps = Pick<
  IOButtonProps,
  'accessibilityLabel' | 'icon' | 'label' | 'onPress' | 'testID'
>;

type OperationResultScreenContentProps = WithTestID<{
  action?: ButtonProps;
  isHeaderVisible?: boolean;
  pictogram?: IOPictograms;
  secondaryAction?: ButtonProps;
  subtitle?: BodyProps[] | string;
  title: string;
}>;

/**
 * A screen component which displays the result of an operation.
 * I can either be a successfull operation or a failed one.
 * It shows a pictogram, a title, a subtitle, and action buttons.
 * @param pictogram - The pictogram to display.
 * @param title - The title of the screen.
 * @param subtitle - The subtitle of the screen.
 * @param action - The primary action button.
 * @param secondaryAction - The secondary action button.
 * @param isHeaderVisible - Whether the header should be visible or not.
 * @param testID - The testID to be used for testing.
 */
const OperationResultScreenContent = forwardRef<
  View,
  PropsWithChildren<OperationResultScreenContentProps>
>(
  (
    {
      action,
      children,
      isHeaderVisible,
      pictogram,
      secondaryAction,
      subtitle,
      testID,
      title
    },
    ref
  ) => (
    <SafeAreaView
      edges={isHeaderVisible ? ['bottom'] : undefined}
      ref={ref}
      style={styles.container}
      testID={testID}
    >
      <ScrollView
        centerContent={true}
        contentContainerStyle={[
          styles.wrapper,
          /* Android fallback because `centerContent` is only an iOS property */
          Platform.OS === 'android' && styles.wrapper_android
        ]}
      >
        {pictogram && (
          <View style={styles.alignCenter}>
            <Pictogram name={pictogram} size={120} />
            <VSpacer size={24} />
          </View>
        )}
        <H3 style={{ textAlign: 'center' }}>{title}</H3>
        {subtitle && (
          <>
            <VSpacer size={8} />
            {typeof subtitle === 'string' ? (
              <Body style={{ textAlign: 'center' }}>{subtitle}</Body>
            ) : (
              <ComposedBodyFromArray body={subtitle} textAlign="center" />
            )}
          </>
        )}
        {action && (
          <View style={styles.alignCenter}>
            <VSpacer size={24} />
            <View>
              <IOButton variant="solid" {...action} />
            </View>
          </View>
        )}
        {secondaryAction && (
          <View style={styles.alignCenter}>
            <VSpacer size={24} />
            <View>
              <IOButton variant="link" {...secondaryAction} />
            </View>
          </View>
        )}

        {isValidElement(children) && cloneElement(children)}
      </ScrollView>
    </SafeAreaView>
  )
);

const styles = StyleSheet.create({
  alignCenter: {
    alignItems: 'center'
  },
  container: {
    flexGrow: 1,
    marginHorizontal: IOVisualCostants.appMarginDefault
  },
  wrapper: {
    alignContent: 'center',
    alignItems: 'stretch',
    flex: 1,
    justifyContent: 'center'
  },
  wrapper_android: {
    flexGrow: 1,
    justifyContent: 'center'
  }
});

export { OperationResultScreenContent };
export type { OperationResultScreenContentProps };
