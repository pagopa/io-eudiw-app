import { StackScreenProps } from '@react-navigation/stack';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Body } from '@pagopa/io-app-design-system';
import {
  LoadingScreenContent,
  useDisableGestureNavigation,
  useHardwareBackButton
} from '@io-eudiw-app/commons';
import { WalletNavigatorParamsList } from '../../navigation/wallet/WalletNavigator';
import WALLET_ROUTES from '../../navigation/wallet/routes';
import { useAppDispatch, useAppSelector } from '../../store';
import { lifecycleIsOperationalSelector } from '../../store/lifecycle';
import {
  setCredentialIssuancePreAuthError,
  setCredentialIssuancePreAuthRequest
} from '../../store/credentialIssuance';
import { selectCredentials } from '../../store/credentials';
import { getCredentialTypeByConfigId } from '../../utils/credentials';

export type CredentialOfferParams = {
  issuerUrl: string;
  credentialConfigId: string;
};

type Props = StackScreenProps<
  WalletNavigatorParamsList,
  'CREDENTIAL_OFFER_ISSUANCE'
>;

/**
 * Landing screen for credential offer (OID4VCI) deep links and QR codes
 * (`openid-credential-offer://`, `haip-vci://`).
 *
 * It resolves and validates the offer, extracts the issuer URL and the
 * credential configuration id, then starts the regular issuance flow:
 * - if the PID has to be obtained first, the credential (with its issuer URL)
 *   is stored as pending and the PID issuance flow is started; issuance resumes
 *   automatically once the PID is available;
 * - otherwise the pre-authorization request is dispatched and the user is taken
 *   to the trust screen.
 *
 * On resolution failure the user is taken to the credential issuance failure
 * screen.
 */
const CredentialOffer = ({ route, navigation }: Props) => {
  const { t } = useTranslation(['common', 'wallet']);
  const dispatch = useAppDispatch();
  const shouldIssuePidFirst = useAppSelector(lifecycleIsOperationalSelector);
  const credentials = useAppSelector(selectCredentials);

  // Disable the back gesture navigation and the hardware back button while resolving
  useDisableGestureNavigation();
  useHardwareBackButton(() => true);

  // The offer must be resolved and routed exactly once.
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) {
      return;
    }
    handledRef.current = true;

    try {
      const { issuerUrl, credentialConfigId } = route.params;

      // If the offered credential is already in the wallet, there is nothing
      // to issue: inform the user and let them go back to the Wallet Home.
      const credentialType = getCredentialTypeByConfigId(credentialConfigId);
      if (
        credentialType !== undefined &&
        credentials.some(c => c.credentialType === credentialType)
      ) {
        navigation.replace(WALLET_ROUTES.CREDENTIAL_ISSUANCE.ALREADY_OBTAINED);
        return;
      }

      if (shouldIssuePidFirst) {
        // The wallet is not active yet: prompt the user to activate it,
        // carrying the offered credential so its issuance resumes once the
        // PID has been obtained.
        navigation.replace(WALLET_ROUTES.PRESENTATION.WALLET_NOT_ACTIVE, {
          pendingCredential: {
            credential: credentialConfigId,
            issuerUrl
          }
        });
        return;
      }

      // Start the pre-authorization; the trust screen handles its own loading
      // until the required claims are available.
      dispatch(
        setCredentialIssuancePreAuthRequest({
          credential: credentialConfigId,
          issuerUrl
        })
      );
      navigation.replace(WALLET_ROUTES.CREDENTIAL_ISSUANCE.TRUST);
    } catch (error) {
      dispatch(setCredentialIssuancePreAuthError({ error }));
      navigation.replace(WALLET_ROUTES.CREDENTIAL_ISSUANCE.FAILURE);
    }
  }, [route.params, shouldIssuePidFirst, credentials, dispatch, navigation]);

  return (
    <LoadingScreenContent
      contentTitle={t('wallet:credentialOffer.loading.title')}
    >
      <Body style={{ textAlign: 'center' }}>
        {t('wallet:credentialOffer.loading.subtitle')}
      </Body>
    </LoadingScreenContent>
  );
};

export default CredentialOffer;
