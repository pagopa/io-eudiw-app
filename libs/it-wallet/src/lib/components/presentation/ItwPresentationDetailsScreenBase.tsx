import { ReactNode } from 'react';
import Animated, {
  useAnimatedRef,
  useSharedValue
} from 'react-native-reanimated';
import {
  ButtonBlockProps,
  IOScrollView,
  IOScrollViewActions,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
import { useScreenReaderEnabled } from '../../hooks/useScreenReaderEnabled';
import { lifecycleIsValidSelector } from '../../store/lifecycle';
import { wellKnownCredential } from '../../utils/credentials';
import { useHeaderPropsByCredentialType } from '../../utils/itwStyleUtils';
import { StoredCredential } from '../../utils/itwTypesUtils';
import { useAppSelector } from '../../store';

export type CredentialCtaProps = ButtonBlockProps;

type ItwPresentationDetailsScreenBaseProps = {
  credential: StoredCredential;
  children?: ReactNode;
  ctaProps?: CredentialCtaProps;
};

// eslint-disable-next-line @typescript-eslint/no-inferrable-types
const scrollTriggerOffsetValue: number = 88;

const ItwPresentationDetailsScreenBase = ({
  credential,
  children,
  ctaProps
}: ItwPresentationDetailsScreenBaseProps) => {
  const animatedScrollViewRef = useAnimatedRef<Animated.ScrollView>();
  const itwFeaturesEnabled = useAppSelector(lifecycleIsValidSelector);
  const scrollTranslationY = useSharedValue(0);
  const screenReaderEnabled = useScreenReaderEnabled();

  const headerProps = useHeaderPropsByCredentialType(
    credential.credentialType,
    itwFeaturesEnabled
  );
  const isBonusCardHeader =
    credential.credentialType === wellKnownCredential.BONUS_PARI;

  // TODO add support toast?

  useHeaderSecondLevel({
    scrollValues: {
      triggerOffset: scrollTriggerOffsetValue,
      contentOffsetY: scrollTranslationY
    },
    supportRequest: true,
    enableDiscreteTransition: true,
    animatedRef: animatedScrollViewRef,
    ...headerProps,
    transparent: isBonusCardHeader ? !screenReaderEnabled : undefined,
    variant: 'neutral'
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
