import {
  HeaderSecondLevel,
  hexToRgba,
  IOButton,
  IOButtonLinkSpecificProps,
  IOColors,
  IOSpacer,
  IOSpacingScale,
  IOVisualCostants,
  useIOTheme,
  VSpacer,
  WithTestID
} from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import {
  ComponentProps,
  Fragment,
  PropsWithChildren,
  useLayoutEffect,
  useState
} from 'react';
import {
  ColorValue,
  LayoutChangeEvent,
  LayoutRectangle,
  RefreshControl,
  RefreshControlProps,
  StyleSheet,
  View,
  ViewStyle
} from 'react-native';
import { easeGradient } from 'react-native-easing-gradient';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  AnimatedRef,
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ButtonBlockProps } from './utils/buttons';

export type IOScrollViewActions =
  | {
      primary: ButtonBlockProps;
      secondary: ButtonBlockProps;
      tertiary: ButtonLinkProps;
      type: 'ThreeButtons';
    }
  | {
      primary: ButtonBlockProps;
      secondary: ButtonLinkProps;
      tertiary?: never;
      type: 'TwoButtons';
    }
  | {
      primary: ButtonBlockProps;
      secondary?: never;
      tertiary?: never;
      type: 'SingleButton';
    };

type ButtonLinkProps = Omit<IOButtonLinkSpecificProps, 'color' | 'variant'>;

type IOSCrollViewHeaderScrollValues = ComponentProps<
  typeof HeaderSecondLevel
>['scrollValues'];

type IOScrollViewProps = WithTestID<
  PropsWithChildren<{
    actions?: IOScrollViewActions;
    animatedRef?: AnimatedRef<Animated.ScrollView>;
    /* Center content in iOS without inertial scrolling */
    centerContent?: boolean;
    contentContainerStyle?: ViewStyle;
    debugMode?: boolean;
    /* Don't include end content margin */
    excludeEndContentMargin?: boolean;
    /* Don't include safe area insets */
    excludeSafeAreaMargins?: boolean;
    headerConfig?: ComponentProps<typeof HeaderSecondLevel>;
    /* Include page margins */
    includeContentMargins?: boolean;
    refreshControlProps?: RefreshControlProps;
    snapOffset?: number;
  }>
>;

/* Percentage of scrolled content that triggers
   the gradient opaciy transition */
const gradientOpacityScrollTrigger = 0.85;
/* Extended gradient area above the actions */
const gradientSafeAreaHeight: IOSpacingScale = 96;
/* End content margin before the actions */
const contentEndMargin: IOSpacingScale = 32;
/* Margin between ButtonSolid and ButtonOutline */
const spaceBetweenActions: IOSpacer = 16;
/* Margin between ButtonSolid and ButtonLink */
const spaceBetweenActionAndLink: IOSpacer = 16;
/* Extra bottom margin for iPhone bottom handle because
   ButtonLink doesn't have a fixed height */
const extraSafeAreaMargin: IOSpacingScale = 8;

const styles = StyleSheet.create({
  buttonContainer: {
    flexShrink: 0,
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    width: '100%'
  },
  centerContentWrapper: {
    alignContent: 'center',
    alignItems: 'stretch',
    flexGrow: 1,
    justifyContent: 'center'
  },
  gradientBottomActions: {
    bottom: 0,
    justifyContent: 'flex-end',
    position: 'absolute',
    width: '100%'
  },
  gradientContainer: {
    ...StyleSheet.absoluteFill
  }
});

/**
 * The main scrollable container component.
 * It includes full support for custom headers and actions.
 *
 * @param headerConfig - Configuration for the header component. Use this only if you need to configure a custom header from scratch.
 * If you need the predefined configuration with default `Back (<)` and `Help (?)` buttons, use `useHeaderSecondLevel`
 * @param actions - Actions to be rendered at the bottom of the `ScrollView`
 * @param animatedRef - Ref generated through `useAnimatedRef` (used by `useScrollViewOffset` to get the scroll position)
 * @param snapOffset - Offset when you need to add a snap point
 * @param excludeSafeAreaMargins -  Exclude safe area margins at the bottom of the `ScrollView`, false as default.
 * This is useful if you have a screen with a tab bar at the bottom, or if the bottom margin is already being managed
 * @param excludeEndContentMargin - Exclude the end content margin, false as default
 * @param includeContentMargins - Include horizontal screen margins, true as default
 * @param debugMode - Enable debug mode. Only for testing purposes, false as default
 */
// eslint-disable-next-line max-lines-per-function
export const IOScrollView = ({
  actions,
  animatedRef,
  centerContent,
  children,
  contentContainerStyle,
  debugMode = false,
  excludeEndContentMargin = false,
  excludeSafeAreaMargins = false,
  headerConfig,
  includeContentMargins = true,
  refreshControlProps,
  snapOffset,
  testID
}: IOScrollViewProps) => {
  const theme = useIOTheme();

  /* Navigation */
  const navigation = useNavigation();

  /* Shared Values for `reanimated` */
  const scrollPositionAbsolute =
    useSharedValue(0); /* Scroll position (Absolute) */
  const scrollPositionPercentage =
    useSharedValue(0); /* Scroll position (Relative) */

  /* Total height of actions */
  const [actionBlockHeight, setActionBlockHeight] =
    useState<LayoutRectangle['height']>(0);

  const getActionBlockHeight = (event: LayoutChangeEvent) => {
    setActionBlockHeight(event.nativeEvent.layout.height);
  };

  const insets = useSafeAreaInsets();
  const needSafeAreaMargin = insets.bottom !== 0;

  /* Check if the iPhone bottom handle is present.
     If not, or if you don't need safe area insets,
     add a default margin to prevent the button
     from sticking to the bottom. */
  const bottomMargin =
    !needSafeAreaMargin || excludeSafeAreaMargins
      ? IOVisualCostants.appMarginDefault
      : insets.bottom;

  /* GENERATE EASING GRADIENT
     Background color should be app main background
     (both light and dark themes) */
  const HEADER_BG_COLOR: ColorValue = IOColors[theme['appBackground-primary']];

  const { colors, locations } = easeGradient({
    colorStops: {
      0: { color: hexToRgba(HEADER_BG_COLOR, 0) },
      1: { color: HEADER_BG_COLOR }
    },
    easing: Easing.ease,
    extraColorStopsPerTransition: 20
  });

  /* When the secondary action is visible, add extra margin
     to avoid little space from iPhone bottom handle */
  const extraBottomMargin =
    actions?.secondary && needSafeAreaMargin ? extraSafeAreaMargin : 0;

  /* Safe background block. Cover at least 85% of the space
     to avoid glitchy elements underneath */
  const safeBackgroundBlockHeight = (bottomMargin + actionBlockHeight) * 0.85;

  /* Total height of "Actions + Gradient" area */
  const gradientAreaHeight =
    bottomMargin + actionBlockHeight + gradientSafeAreaHeight;

  /* Height of the safe bottom area, applied to the ScrollView:
     Actions + Content end margin */
  const safeBottomAreaHeight =
    bottomMargin + actionBlockHeight + contentEndMargin;

  const handleScroll = useAnimatedScrollHandler(
    ({ contentOffset, contentSize, layoutMeasurement }) => {
      const scrollPosition = contentOffset.y;
      const maxScrollHeight = contentSize.height - layoutMeasurement.height;
      const scrollPercentage = scrollPosition / maxScrollHeight;

      scrollPositionAbsolute.value = scrollPosition;
      scrollPositionPercentage.value = scrollPercentage;
    }
  );

  const opacityTransition = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollPositionPercentage.value,
      [0, gradientOpacityScrollTrigger, 1],
      [1, 1, 0],
      Extrapolation.CLAMP
    )
  }));

  /* Set custom header with `react-navigation` library using
     `useLayoutEffect` hook */

  useLayoutEffect(() => {
    const scrollValues: IOSCrollViewHeaderScrollValues = {
      contentOffsetY: scrollPositionAbsolute,
      triggerOffset: snapOffset || 0
    };

    if (headerConfig) {
      navigation.setOptions({
        header: () => (
          <HeaderSecondLevel {...headerConfig} scrollValues={scrollValues} />
        ),
        headerTransparent: headerConfig.transparent
      });
    }
  }, [headerConfig, navigation, scrollPositionAbsolute, snapOffset]);

  const RefreshControlComponent = refreshControlProps ? (
    <RefreshControl {...refreshControlProps} />
  ) : undefined;

  return (
    <Fragment>
      <Animated.ScrollView
        centerContent={centerContent}
        contentContainerStyle={[
          {
            paddingBottom: excludeEndContentMargin
              ? 0
              : actions
                ? safeBottomAreaHeight
                : bottomMargin + contentEndMargin,
            paddingHorizontal: includeContentMargins
              ? IOVisualCostants.appMarginDefault
              : 0,
            ...contentContainerStyle
          },
          /* Apply the same logic used in the
          `OperationResultScreenContent` component */
          centerContent ? styles.centerContentWrapper : {}
        ]}
        decelerationRate="normal"
        onScroll={handleScroll}
        ref={animatedRef}
        refreshControl={RefreshControlComponent}
        scrollEventThrottle={8}
        snapToEnd={false}
        snapToOffsets={[0, snapOffset || 0]}
        testID={testID}
      >
        {children}
      </Animated.ScrollView>
      {actions && (
        <View
          pointerEvents="box-none"
          style={[
            styles.gradientBottomActions,
            {
              height: gradientAreaHeight,
              paddingBottom: bottomMargin
            }
          ]}
          {...(testID && { testID: `${testID}-actions` })}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.gradientContainer,
              debugMode && {
                backgroundColor: hexToRgba(IOColors['error-500'], 0.15)
              }
            ]}
          >
            <Animated.View
              style={[
                opacityTransition,
                debugMode && {
                  backgroundColor: hexToRgba(IOColors['error-500'], 0.4),
                  borderTopColor: IOColors['error-500'],
                  borderTopWidth: 1
                }
              ]}
            >
              <LinearGradient
                colors={colors}
                locations={locations}
                style={{
                  height: gradientAreaHeight - safeBackgroundBlockHeight
                }}
              />
            </Animated.View>

            {/* Safe background block. It's added because when you swipe up
                quickly, the content below is visible for about 100ms. Without this
                block, the content appears glitchy. */}
            <View
              style={{
                backgroundColor: HEADER_BG_COLOR,
                bottom: 0,
                height: safeBackgroundBlockHeight
              }}
            />
          </Animated.View>
          <View
            onLayout={getActionBlockHeight}
            pointerEvents="box-none"
            style={styles.buttonContainer}
          >
            {renderActionButtons(actions, extraBottomMargin)}
          </View>
        </View>
      )}
    </Fragment>
  );
};

const renderActionButtons = (
  actions: IOScrollViewActions,
  extraBottomMargin: number
) => {
  const {
    primary: primaryAction,
    secondary: secondaryAction,
    tertiary: tertiaryAction,
    type
  } = actions;

  return (
    <>
      {primaryAction && (
        <IOButton fullWidth variant="solid" {...primaryAction} />
      )}

      {type === 'TwoButtons' && (
        <View
          style={{
            alignSelf: 'center',
            marginBottom: extraBottomMargin
          }}
        >
          <VSpacer size={spaceBetweenActionAndLink} />
          <IOButton color="primary" variant="link" {...secondaryAction} />
        </View>
      )}

      {type === 'ThreeButtons' && (
        <Fragment>
          <VSpacer size={spaceBetweenActions} />
          <IOButton
            color="primary"
            fullWidth
            variant="outline"
            {...secondaryAction}
          />

          <View
            style={{
              alignSelf: 'center',
              marginBottom: extraBottomMargin
            }}
          >
            <VSpacer size={spaceBetweenActionAndLink} />
            <IOButton color="primary" variant="link" {...tertiaryAction} />
          </View>
        </Fragment>
      )}
    </>
  );
};
