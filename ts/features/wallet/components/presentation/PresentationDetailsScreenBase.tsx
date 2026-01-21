import {
  ButtonSolidProps,
  FooterActions,
  useFooterActionsMeasurements
} from '@pagopa/io-app-design-system';

import { Fragment, ReactNode } from 'react';
import Animated, {
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue
} from 'react-native-reanimated';
import { useHeaderSecondLevel } from '../../../../hooks/useHeaderSecondLevel';
import { StoredCredential } from '../../utils/itwTypesUtils';
import { getHeaderPropsByCredentialType } from '../../utils/style';

export type CredentialCtaProps = Omit<ButtonSolidProps, 'fullWidth'>;

export type PresentationDetailsScreenBaseProps = {
  credential: StoredCredential;
  children?: ReactNode;
  ctaProps?: CredentialCtaProps;
};

const scrollTriggerOffsetValue: number = 88;

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

  const { footerActionsMeasurements, handleFooterActionsMeasurements } =
    useFooterActionsMeasurements();

  const gradientOpacity = useSharedValue(1);
  const scrollTranslationY = useSharedValue(0);

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
    ({ contentOffset, layoutMeasurement, contentSize }) => {
      // eslint-disable-next-line
      scrollTranslationY.value = contentOffset.y;

      const isEndReached =
        Math.floor(layoutMeasurement.height + contentOffset.y) >=
        Math.floor(contentSize.height);

      // eslint-disable-next-line
      gradientOpacity.value = isEndReached ? 0 : 1;
    }
  );

  const footerComponent = ctaProps && (
    <FooterActions
      onMeasure={handleFooterActionsMeasurements}
      actions={{
        type: 'SingleButton',
        primary: ctaProps
      }}
    />
  );

  return (
    <Fragment>
      <Animated.ScrollView
        ref={animatedScrollViewRef}
        contentContainerStyle={{
          paddingBottom: footerActionsMeasurements.safeBottomAreaHeight
        }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        snapToOffsets={[0, scrollTriggerOffsetValue]}
        snapToEnd={false}
        decelerationRate="normal"
      >
        {children}
      </Animated.ScrollView>
      {footerComponent}
    </Fragment>
  );
};

export { PresentationDetailsScreenBase };
