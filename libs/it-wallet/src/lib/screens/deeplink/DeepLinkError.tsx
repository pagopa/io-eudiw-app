import { StackScreenProps } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { resetUrl } from '@io-eudiw-app/navigation';
import {
  OperationResultScreenContent,
  useDisableGestureNavigation,
  useHardwareBackButton
} from '@io-eudiw-app/commons';
import { WalletNavigatorParamsList } from '../../navigation/wallet/WalletNavigator';
import { useAppDispatch } from '../../store';
import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';

/**
 * Navigation params for the deep link error screen.
 * `source` selects the error copy depending on how the failed flow was started:
 * - `qr`   -> the URL came from a scanned QR code
 * - `link` -> the URL came from a deep link
 */
export type DeepLinkErrorParams = {
  source: 'qr' | 'link';
};

type Props = StackScreenProps<WalletNavigatorParamsList, 'DEEP_LINK_ERROR'>;

/**
 * Error screen shown when a deep link / QR code URL cannot be parsed by
 * {@link DeepLinkHandler}. It presents a single action that clears the pending
 * deep link URL and takes the user back to the Wallet Home. The error copy is
 * differentiated via the `source` param so QR and deep link failures read
 * naturally.
 */
const DeepLinkError = ({ route }: Props) => {
  const { t } = useTranslation('wallet');
  const dispatch = useAppDispatch();
  const { navigateToWallet } = useNavigateToWalletWithReset();
  const { source } = route.params;

  useDisableGestureNavigation();
  useHardwareBackButton(() => true);

  const onPress = () => {
    dispatch(resetUrl());
    navigateToWallet();
  };

  return (
    <OperationResultScreenContent
      pictogram="umbrella"
      title={t(`deepLink.error.${source}.title`)}
      subtitle={t(`deepLink.error.${source}.subtitle`)}
      action={{
        accessibilityLabel: t('deepLink.error.button'),
        label: t('deepLink.error.button'),
        onPress
      }}
    />
  );
};

export default DeepLinkError;
