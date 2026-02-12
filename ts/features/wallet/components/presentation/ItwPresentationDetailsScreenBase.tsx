import { ReactNode } from 'react';
import Animated, {
  useAnimatedRef,
  useSharedValue
} from 'react-native-reanimated';
import { ButtonBlockProps } from '../../../../components/ui/utils/buttons';
import { useHeaderSecondLevel } from '../../../../hooks/useHeaderSecondLevel';
import { useAppSelector } from '../../../../store';
import { lifecycleIsValidSelector } from '../../store/lifecycle';
import { useHeaderPropsByCredentialType } from '../../utils/itwStyleUtils';
import { StoredCredential } from '../../utils/itwTypesUtils';
import {
  IOScrollView,
  IOScrollViewActions
} from '@/ts/components/IOScrollView';

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

  const actions: IOScrollViewActions | undefined = ctaProps
    ? { type: 'SingleButton', primary: ctaProps }
    : undefined;

  return (
    <IOScrollView
      animatedRef={animatedScrollViewRef}
      includeContentMargins={false}
      actions={actions}
    >
      {children}
    </IOScrollView>
  );
};

export { ItwPresentationDetailsScreenBase };
