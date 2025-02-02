import {
  ButtonSolidProps,
  GradientBottomActions,
  IOSpacer,
  IOSpacingScale,
  IOVisualCostants,
  buttonSolidHeight
} from '@pagopa/io-app-design-system';

import React, {Fragment, ReactNode, useMemo} from 'react';
import Animated, {
  Easing,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {StoredCredential} from '../../utils/types';
import {useHeaderSecondLevel} from '../../../../hooks/useHeaderSecondLevel';
import {getHeaderPropsByCredentialType} from '../../utils/style';

export type CredentialCtaProps = Omit<ButtonSolidProps, 'fullWidth'>;

export type PresentationDetailsScreenBaseProps = {
  credential: StoredCredential;
  children?: ReactNode;
  ctaProps?: CredentialCtaProps;
};

const scrollTriggerOffsetValue: number = 88;

const gradientSafeArea: IOSpacingScale = 80;
const contentEndMargin: IOSpacingScale = 32;
const spaceBetweenActions: IOSpacer = 24;

/**
 * This component renders the base layout for the credential details screen.
 * It contains an animated scrollview and a footer with a gradient background.
 * Each child component forming the presentation details screen should be rendered inside this component.
 */
const PresentationDetailsScreenBase = ({
  credential,
  children,
  ctaProps
}: PresentationDetailsScreenBaseProps) => {
  const animatedScrollViewRef = useAnimatedRef<Animated.ScrollView>();
  const safeAreaInsets = useSafeAreaInsets();

  const gradientOpacity = useSharedValue(1);
  const scrollTranslationY = useSharedValue(0);

  const bottomMargin: number = useMemo(
    () =>
      safeAreaInsets.bottom === 0
        ? IOVisualCostants.appMarginDefault
        : safeAreaInsets.bottom,
    [safeAreaInsets]
  );

  const safeBottomAreaHeight: number = useMemo(
    () => bottomMargin + buttonSolidHeight + contentEndMargin,
    [bottomMargin]
  );

  const gradientAreaHeight: number = useMemo(
    () => bottomMargin + buttonSolidHeight + gradientSafeArea,
    [bottomMargin]
  );

  const headerProps = getHeaderPropsByCredentialType(credential.credentialType);

  useHeaderSecondLevel({
    scrollValues: {
      triggerOffset: scrollTriggerOffsetValue,
      contentOffsetY: scrollTranslationY
    },
    enableDiscreteTransition: true,
    animatedRef: animatedScrollViewRef,
    ...headerProps
  });

  const scrollHandler = useAnimatedScrollHandler(
    ({contentOffset, layoutMeasurement, contentSize}) => {
      // eslint-disable-next-line functional/immutable-data
      scrollTranslationY.value = contentOffset.y;

      const isEndReached =
        Math.floor(layoutMeasurement.height + contentOffset.y) >=
        Math.floor(contentSize.height);

      // eslint-disable-next-line functional/immutable-data
      gradientOpacity.value = isEndReached ? 0 : 1;
    }
  );

  const footerGradientOpacityTransition = useAnimatedStyle(() => ({
    opacity: withTiming(gradientOpacity.value, {
      duration: 200,
      easing: Easing.ease
    })
  }));

  const footerComponent = ctaProps && (
    <GradientBottomActions
      primaryActionProps={ctaProps}
      transitionAnimStyle={footerGradientOpacityTransition}
      dimensions={{
        bottomMargin,
        extraBottomMargin: 0,
        gradientAreaHeight,
        spaceBetweenActions,
        safeBackgroundHeight: bottomMargin
      }}
    />
  );

  return (
    <Fragment>
      <Animated.ScrollView
        ref={animatedScrollViewRef}
        contentContainerStyle={{
          paddingBottom: safeBottomAreaHeight
        }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        snapToOffsets={[0, scrollTriggerOffsetValue]}
        snapToEnd={false}
        decelerationRate="normal">
        {children}
      </Animated.ScrollView>
      {footerComponent}
    </Fragment>
  );
};

export {PresentationDetailsScreenBase};
