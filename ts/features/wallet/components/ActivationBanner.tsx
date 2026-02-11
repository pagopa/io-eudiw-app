import { Banner, VSpacer } from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { GestureResponderEvent } from 'react-native';
/**
 * Common props for the component which are always required.
 */
type CommonProps = {
  title: string;
  content: string;
  action: string;
};

/**
 * Discriminated union props for the component which make the onClose callback optional and labelClose required if onClose is defined.
 */
type TruncateProps =
  | { onClose?: (event: GestureResponderEvent) => void; labelClose?: never }
  | { onClose: (event: GestureResponderEvent) => void; labelClose: string };

type ItwActionBannerProps = CommonProps & TruncateProps;

/**
 * The base graphical component, take a text as input and dispatch onPress when pressed
 * include also a close button
 */
export const ActivationBanner = ({
  title,
  content,
  action,
  onClose,
  labelClose
}: ItwActionBannerProps): React.ReactElement => {
  const navigation = useNavigation();

  return (
    <>
      <VSpacer size={24} />
      <Banner
        testID={'ItwBannerTestID'}
        color={'turquoise'}
        title={title}
        content={content}
        pictogramName={'itWallet'}
        action={action}
        labelClose={labelClose}
        onPress={() =>
          navigation.navigate('MAIN_WALLET_NAV', {
            screen: 'PID_ISSUANCE_INSTANCE_CREATION'
          })
        }
        onClose={onClose}
      />
    </>
  );
};
