import {
  FooterActions,
  useFooterActionsMeasurements
} from '@pagopa/io-app-design-system';
import { Fragment, ReactNode } from 'react';
import Animated, {
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue
} from 'react-native-reanimated';
import { ButtonBlockProps } from '../../../../components/ui/utils/buttons';
import { useHeaderSecondLevel } from '../../../../hooks/useHeaderSecondLevel';
import { useAppSelector } from '../../../../store';
import { lifecycleIsValidSelector } from '../../store/lifecycle';
import { useHeaderPropsByCredentialType } from '../../utils/itwStyleUtils';
import { StoredCredential } from '../../utils/itwTypesUtils';

export type CredentialCtaProps = ButtonBlockProps;

export type ItwPresentationDetailsScreenBaseProps = {
  credential: StoredCredential;
  children?: ReactNode;
  ctaProps?: CredentialCtaProps;
};

const scrollTriggerOffsetValue: number = 88;

const ItwPresentationDetailsScreenBase = ({
  credential,
  children,
  ctaProps
}: ItwPresentationDetailsScreenBaseProps) => {
  const animatedScrollViewRef = useAnimatedRef<Animated.ScrollView>();
  const itwFeaturesEnabled = useAppSelector(lifecycleIsValidSelector);
  const scrollTranslationY = useSharedValue(0);

  const { footerActionsMeasurements, handleFooterActionsMeasurements } =
    useFooterActionsMeasurements();

  const headerProps = useHeaderPropsByCredentialType(
    credential.credentialType,
    itwFeaturesEnabled
  );

  // TODO add support toast?

  useHeaderSecondLevel({
    scrollValues: {
      triggerOffset: scrollTriggerOffsetValue,
      contentOffsetY: scrollTranslationY
    },
    supportRequest: true,
    enableDiscreteTransition: true,
    animatedRef: animatedScrollViewRef,
    ...headerProps
  });

  const scrollHandler = useAnimatedScrollHandler(({ contentOffset }) => {
    scrollTranslationY.value = contentOffset.y;
  });

  return (
    <Fragment>
      <Animated.ScrollView
        ref={animatedScrollViewRef}
        contentContainerStyle={{
          paddingBottom: footerActionsMeasurements.safeBottomAreaHeight || 24
        }}
        onScroll={scrollHandler}
        scrollEventThrottle={8}
        snapToOffsets={[0, scrollTriggerOffsetValue]}
        snapToEnd={false}
        decelerationRate="normal"
      >
        {children}
      </Animated.ScrollView>
      {ctaProps && (
        <FooterActions
          onMeasure={handleFooterActionsMeasurements}
          actions={{
            type: 'SingleButton',
            primary: ctaProps
          }}
        />
      )}
    </Fragment>
  );
};

export { ItwPresentationDetailsScreenBase };
