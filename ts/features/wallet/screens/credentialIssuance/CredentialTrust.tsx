import {
  FeatureInfo,
  FooterActions,
  ForceScrollDownView,
  H2,
  IOVisualCostants,
  VSpacer,
  VStack
} from '@pagopa/io-app-design-system';
import { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { selectCredential } from '../../store/credentials';
import {
  getCredentialNameByType,
  wellKnownCredential
} from '../../utils/credentials';
import { useHeaderSecondLevel } from '../../../../hooks/useHeaderSecondLevel';
import {
  resetCredentialIssuance,
  selectCredentialIssuancePostAuthStatus,
  selectRequestedCredentialType,
  setCredentialIssuancePostAuthRequest
} from '../../store/credentialIssuance';
import { useNavigateToWalletWithReset } from '../../../../hooks/useNavigateToWalletWithReset';
import { useItwDismissalDialog } from '../../hooks/useItwDismissalDialog';
import { useDisableGestureNavigation } from '../../../../hooks/useDisableGestureNavigation';
import IOMarkdown from '../../../../components/IOMarkdown';
import { ISSUER_MOCK_NAME } from '../../utils/itwMocksUtils';
import { ItwDataExchangeIcons } from '../../components/ItwDataExchangeIcons';
import { WellKnownClaim } from '../../utils/itwClaimsUtils';
import { getCredentialNameFromType } from '../../utils/itwCredentialUtils';
import { ItwRequestedClaimsList } from '../../components/presentation/ItwRequiredClaimsList';
import { parseClaims } from '../../utils/claims';

/**
 * Screen which shows the user the credentials and claims that will be shared with the credential issuer
 * in order to obtain the requisted credential.
 */
const CredentialTrust = () => {
  const dispatch = useAppDispatch();
  const pid = useAppSelector(selectCredential(wellKnownCredential.PID));
  const { t } = useTranslation(['global', 'wallet']);
  const { loading, error, success } = useAppSelector(
    selectCredentialIssuancePostAuthStatus
  );
  const requestedCredential = useAppSelector(selectRequestedCredentialType);
  const navigation = useNavigation();
  const { navigateToWallet } = useNavigateToWalletWithReset();

  const navigateToErrorScreen = useCallback(
    () =>
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'CREDENTIAL_ISSUANCE_FAILURE'
      }),
    [navigation]
  );

  const cancel = useCallback(() => {
    dispatch(resetCredentialIssuance());
    navigateToWallet();
  }, [dispatch, navigateToWallet]);

  const dismissalDialog = useItwDismissalDialog({
    handleDismiss: cancel,
    customLabels: {
      title: t('generic.alert.title', {
        ns: 'wallet'
      }),
      body: t('generic.alert.body', {
        ns: 'wallet'
      }),
      confirmLabel: t('generic.alert.confirm', {
        ns: 'wallet'
      }),
      cancelLabel: t('generic.alert.cancel', {
        ns: 'wallet'
      })
    }
  });

  useHeaderSecondLevel({
    title: '',
    goBack: () => {
      dismissalDialog.show();
    }
  });

  useDisableGestureNavigation();

  /**
   * When the post auth request is successful, navigate to the preview screen
   * which shows the credential preview.
   */
  useEffect(() => {
    if (success.status) {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'CREDENTIAL_ISSUANCE_PREVIEW'
      });
    }
  }, [navigation, success.status]);

  /**
   * If an error occurs during the post auth request, navigate to the error screen.
   */
  useEffect(() => {
    if (error.status) {
      navigateToErrorScreen();
    }
  });

  // This should never happen, however we need to handle because pid might be undefined
  if (!pid) {
    navigateToErrorScreen();
    return null;
  }

  const claims = parseClaims(pid!.parsedCredential, {
    exclude: [WellKnownClaim.unique_id, WellKnownClaim.link_qr_code]
  });

  const requiredClaims = claims.map(claim => ({
    claim,
    source: getCredentialNameFromType(pid.credentialType, '')
  }));

  return (
    <ForceScrollDownView threshold={50}>
      <View style={{ margin: IOVisualCostants.appMarginDefault, flexGrow: 1 }}>
        <VSpacer size={24} />
        <ItwDataExchangeIcons />
        <VSpacer size={24} />
        <VStack space={24}>
          <H2>
            {t('wallet:credentialIssuance.trust.title', {
              credential: getCredentialNameByType(requestedCredential)
            })}
          </H2>
          <IOMarkdown
            content={t('wallet:credentialIssuance.trust.subtitle', {
              relyingParty: ISSUER_MOCK_NAME
            })}
          />
        </VStack>
        <VSpacer size={24} />
        <ItwRequestedClaimsList items={requiredClaims} />
        <VSpacer size={48} />
        <FeatureInfo
          iconName="fornitori"
          body={t('wallet:credentialIssuance.trust.disclaimer.store')}
        />
        <VSpacer size={24} />
        <FeatureInfo
          iconName="trashcan"
          body={t('wallet:credentialIssuance.trust.disclaimer.retention')}
        />
      </View>
      <FooterActions
        fixed={false}
        actions={{
          type: 'TwoButtons',
          primary: {
            label: t('global:buttons.continue'),
            onPress: () => dispatch(setCredentialIssuancePostAuthRequest()),
            loading
          },
          secondary: {
            label: t('global:buttons.cancel'),
            onPress: () => {
              dismissalDialog.show();
            }
          }
        }}
      />
    </ForceScrollDownView>
  );
};

export default CredentialTrust;
