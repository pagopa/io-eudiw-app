import { StackScreenProps } from '@react-navigation/stack';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { resetUrl, selectUrl } from '@io-eudiw-app/navigation';
import {
  LoadingScreenContent,
  useDisableGestureNavigation,
  useHardwareBackButton
} from '@io-eudiw-app/commons';
import { WalletNavigatorParamsList } from '../../navigation/wallet/WalletNavigator';
import WALLET_ROUTES from '../../navigation/wallet/routes';
import { useAppDispatch, useAppSelector } from '../../store';
import { parseDeepLink } from '../../utils/parsing';
import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';
import { resolveCredentialOfferThunk } from '../../middleware/credential';

/**
 * Navigation params for the deep link handler.
 * `url` is provided by the QR code flow; deep links instead rely on the URL
 * stored in the deep linking slice (read via {@link selectUrl}).
 */
export type DeepLinkHandlerParams =
  | {
      url?: string;
    }
  | undefined;

type Props = StackScreenProps<WalletNavigatorParamsList, 'DEEP_LINK_HANDLER'>;

/**
 * Centralized entry point for both deep links and QR code scans.
 *
 * React Navigation strips the scheme before matching, so the linking config
 * cannot route by scheme. This screen instead reads the full URL (including its
 * scheme) and dispatches to the appropriate flow:
 * - presentation schemes -> {@link PresentationPreDefinition}
 * - credential offer schemes -> the credential offer placeholder
 *
 * The URL comes from the navigation params (QR flow) or, for deep links, from
 * the deep linking slice, which is always populated when a URL is received.
 */
const DeepLinkHandler = ({ route, navigation }: Props) => {
  const { t } = useTranslation(['common', 'wallet']);
  const storedUrl = useAppSelector(selectUrl);
  const dispatch = useAppDispatch();
  const { navigateToWallet } = useNavigateToWalletWithReset();

  // Disable the back gesture navigation and the hardware back button while routing
  useDisableGestureNavigation();
  useHardwareBackButton(() => true);

  // The QR flow passes the URL via params; deep links rely on the stored URL.
  // This also tells the two sources apart for the error screen copy.
  const isQrFlow = route.params?.url !== undefined;
  const url = route.params?.url ?? storedUrl;

  // The incoming URL must be parsed and routed exactly once. Without this guard
  // the reset below would change `url`, re-run the effect and clobber the
  // navigation we just performed.
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) {
      return;
    }
    handledRef.current = true;

    const run = async () => {
      if (!url) {
        navigateToWallet();
        return;
      }

      try {
        const parsed = parseDeepLink(url);
        if (parsed.kind === 'presentation') {
          navigation.replace('PRESENTATION_PRE_DEFINITION', parsed.params);
        } else {
          const { issuerUrl, credentialConfigId } = await dispatch(
            resolveCredentialOfferThunk({ url })
          ).unwrap();
          navigation.replace('CREDENTIAL_OFFER_ISSUANCE', {
            issuerUrl,
            credentialConfigId
          });
        }
      } catch {
        navigation.replace(WALLET_ROUTES.DEEP_LINK.ERROR, {
          source: isQrFlow ? 'qr' : 'link'
        });
      } finally {
        dispatch(resetUrl());
      }
    };
    void run();
  }, [url, isQrFlow, navigation, navigateToWallet, dispatch]);

  return <LoadingScreenContent contentTitle={t('common:generics.waiting')} />;
};

export default DeepLinkHandler;
