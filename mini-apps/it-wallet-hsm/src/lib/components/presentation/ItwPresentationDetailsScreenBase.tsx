import {
  ButtonBlockProps,
  IOScrollView,
  IOScrollViewActions,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
import { ReactNode } from 'react';
import Animated, {
  useAnimatedRef,
  useSharedValue
} from 'react-native-reanimated';

import { useAppSelector } from '../../store';
import { lifecycleIsValidSelector } from '../../store/lifecycle';
import { useHeaderPropsByCredentialType } from '../../utils/itwStyleUtils';
import { StoredCredentialMetadata } from '../../utils/itwTypesUtils';

export type CredentialCtaProps = ButtonBlockProps;

type ItwPresentationDetailsScreenBaseProps = {
  children?: ReactNode;
  credential: StoredCredentialMetadata;
  ctaProps?: CredentialCtaProps;
  headerTransparent?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-inferrable-types
const scrollTriggerOffsetValue: number = 88;

const ItwPresentationDetailsScreenBase = ({
  children,
  credential,
  ctaProps,
  headerTransparent = false
}: ItwPresentationDetailsScreenBaseProps) => {
  const animatedScrollViewRef = useAnimatedRef<Animated.ScrollView>();
  const itwFeaturesEnabled = useAppSelector(lifecycleIsValidSelector);
  const scrollTranslationY = useSharedValue(0);

  const headerProps = useHeaderPropsByCredentialType(
    credential.credentialType,
    itwFeaturesEnabled
  );

  // TODO add support toast?

  useHeaderSecondLevel({
    animatedRef: animatedScrollViewRef,
    enableDiscreteTransition: true,
    scrollValues: {
      contentOffsetY: scrollTranslationY,
      triggerOffset: scrollTriggerOffsetValue
    },
    supportRequest: true,
    transparent: headerTransparent,
    ...headerProps
  });

  const actions: IOScrollViewActions | undefined = ctaProps
    ? { primary: ctaProps, type: 'SingleButton' }
    : undefined;

  return (
    <IOScrollView
      actions={actions}
      animatedRef={animatedScrollViewRef}
      includeContentMargins={false}
    >
      {children}
    </IOScrollView>
  );
};

export { ItwPresentationDetailsScreenBase };
