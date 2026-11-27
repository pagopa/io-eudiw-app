import {
  IOMarkdown,
  LoadingScreenContent,
  useDisableGestureNavigation,
  useHardwareBackButton,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
import {
  Body,
  BodySmall,
  ContentWrapper,
  ForceScrollDownView,
  H2,
  ListItemHeader,
  useIOTheme,
  VSpacer,
  VStack
} from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { Fragment, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { ItwDataExchangeIcons } from '../../components/ItwDataExchangeIcons';
import { ItwRequestedClaimsList } from '../../components/presentation/ItwRequiredClaimsList';
import { useItwDismissalDialog } from '../../hooks/useItwDismissalDialog';
import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  resetCredentialIssuance,
  selectCredentialIssuancePostAuthStatus,
  selectCredentialIssuancePreAuthStatus,
  selectRequestedCredentialType,
  setCredentialIssuancePostAuthRequest
} from '../../store/credentialIssuance';
import { selectIsRemoteKeyLocked } from '../../store/instance';
import { getCredentialNameByType } from '../../utils/credentials';
import { getCredentialNameFromType } from '../../utils/itwCredentialUtils';
import { ISSUER_MOCK_NAME } from '../../utils/itwMocksUtils';

/**
 * Screen which shows the user the credentials and claims that will be shared with the credential issuer
 * in order to obtain the requisted credential.
 */
const CredentialTrust = () => {
  const dispatch = useAppDispatch();
  const { error: preAuthError, success: preAuthSuccess } = useAppSelector(
    selectCredentialIssuancePreAuthStatus
  );
  const { t } = useTranslation(['common', 'hsm']);
  const {
    error: postAuthError,
    loading,
    step,
    success
  } = useAppSelector(selectCredentialIssuancePostAuthStatus);
  const isRemoteKeyLocked = useAppSelector(selectIsRemoteKeyLocked);
  const requestedCredential = useAppSelector(selectRequestedCredentialType);
  const navigation = useNavigation();
  const { navigateToWallet } = useNavigateToWalletWithReset();
  const theme = useIOTheme();

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

  const onContinue = useCallback(() => {
    dispatch(setCredentialIssuancePostAuthRequest());
  }, [dispatch]);

  const dismissalDialog = useItwDismissalDialog({
    customLabels: {
      body: t('common:alert.body'),
      cancelLabel: t('common:alert.cancel'),
      confirmLabel: t('common:alert.confirm'),
      title: t('common:alert.title')
    },
    handleDismiss: cancel
  });

  const presentationDetails = preAuthSuccess.status
    ? preAuthSuccess.data
    : undefined;
  const isPreAuthReady = presentationDetails !== undefined;

  useHeaderSecondLevel({
    goBack: () => {
      dismissalDialog.show();
    },
    headerShown: isPreAuthReady,
    title: ''
  });

  useDisableGestureNavigation();

  // While the pre auth request is still loading, block the hardware back button
  // so the user cannot exit the trust screen mid-fetch.
  useHardwareBackButton(() => !isPreAuthReady);

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
   * The PID is bound to a Remote WSCD key, thus its presentation to the issuer is authorized by the IT-Wallet password
   */
  useEffect(() => {
    if (step === 'hsmPasswordRequired') {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'CREDENTIAL_ISSUANCE_HSM_PASSWORD'
      });
    }
  }, [navigation, step]);

  /**
   * The IT-Wallet password has been entered wrong too many times, thus the identity must be confirmed again
   */
  useEffect(() => {
    if (isRemoteKeyLocked) {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'PRESENTATION_REMOTE_KEY_LOCKED'
      });
    }
  }, [navigation, isRemoteKeyLocked]);

  /**
   * If an error occurs during the pre auth or post auth request, navigate to the error screen.
   */
  useEffect(() => {
    if (postAuthError.status || preAuthError.status) {
      navigateToErrorScreen();
    }
  }, [postAuthError.status, preAuthError.status, navigateToErrorScreen]);

  /**
   * While the pre auth response (required claims) is still being fetched,
   * show a loading screen. The required claims are needed to render the
   * trust content below.
   */
  if (!presentationDetails) {
    return (
      <LoadingScreenContent contentTitle={t('hsm:presentation.loading.title')}>
        <Body style={{ textAlign: 'center' }}>
          {t('hsm:presentation.loading.subtitle')}
        </Body>
      </LoadingScreenContent>
    );
  }

  const requiredClaimsByCredential = presentationDetails.map(detail =>
    detail.claimsToDisplay.map(claim => ({
      claim,
      source: getCredentialNameFromType(detail.vct, '')
    }))
  );

  return (
    <ForceScrollDownView
      footerActions={{
        actions: {
          primary: {
            label: t('common:buttons.continue'),
            loading,
            onPress: onContinue
          },
          secondary: {
            label: t('common:buttons.undo'),
            onPress: () => {
              dismissalDialog.show();
            }
          },
          type: 'TwoButtons'
        }
      }}
    >
      <ContentWrapper>
        <VSpacer size={24} />
        <ItwDataExchangeIcons />
        <VSpacer size={24} />
        <VStack space={24}>
          <H2>
            {t('hsm:credentialIssuance.trust.title', {
              credential: getCredentialNameByType(requestedCredential)
            })}
          </H2>
          <IOMarkdown
            content={t('hsm:credentialIssuance.trust.subtitle', {
              organization: ISSUER_MOCK_NAME
            })}
          />
        </VStack>
        <VSpacer size={24} />
        <ListItemHeader
          iconColor={theme['icon-default']}
          iconName="security"
          label={t('hsm:credentialIssuance.trust.requiredData')}
        />
        {requiredClaimsByCredential.map((requiredClaims, index) => (
          <Fragment
            key={`${requiredClaims[0].source ?? 'GENERIC_CREDENTIAL'}_${index}`}
          >
            <ItwRequestedClaimsList items={requiredClaims} />
            {index < requiredClaimsByCredential.length - 1 && (
              <VSpacer size={24} />
            )}
          </Fragment>
        ))}
        <VSpacer size={24} />
        <BodySmall>{t('hsm:credentialIssuance.trust.disclaimer')}</BodySmall>
      </ContentWrapper>
    </ForceScrollDownView>
  );
};

export default CredentialTrust;
