import {
  Body,
  FeatureInfo,
  FooterActions,
  ForceScrollDownView,
  H2,
  IOVisualCostants,
  ListItemHeader,
  useIOTheme,
  VSpacer,
  VStack
} from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { Fragment, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import {
  IOMarkdown,
  LoadingScreenContent,
  useDisableGestureNavigation,
  useHardwareBackButton,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
import { ItwDataExchangeIcons } from '../../components/ItwDataExchangeIcons';
import { ItwRequestedClaimsList } from '../../components/presentation/ItwRequiredClaimsList';
import { useItwDismissalDialog } from '../../hooks/useItwDismissalDialog';
import {
  resetCredentialIssuance,
  selectCredentialIssuancePostAuthStatus,
  selectCredentialIssuancePreAuthStatus,
  selectRequestedCredentialType,
  setCredentialIssuancePostAuthRequest
} from '../../store/credentialIssuance';
import { getCredentialNameByType } from '../../utils/credentials';
import { getCredentialNameFromType } from '../../utils/itwCredentialUtils';
import { ISSUER_MOCK_NAME } from '../../utils/itwMocksUtils';
import { useAppDispatch, useAppSelector } from '../../store';
import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';

/**
 * Screen which shows the user the credentials and claims that will be shared with the credential issuer
 * in order to obtain the requisted credential.
 */
const CredentialTrust = () => {
  const dispatch = useAppDispatch();
  const { success: preAuthSuccess, error: preAuthError } = useAppSelector(
    selectCredentialIssuancePreAuthStatus
  );
  const { t } = useTranslation(['common', 'wallet']);
  const {
    loading,
    error: postAuthError,
    success
  } = useAppSelector(selectCredentialIssuancePostAuthStatus);
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
    handleDismiss: cancel,
    customLabels: {
      title: t('common:alert.title'),
      body: t('common:alert.body'),
      confirmLabel: t('common:alert.confirm'),
      cancelLabel: t('common:alert.cancel')
    }
  });

  const presentationDetails = preAuthSuccess.status
    ? preAuthSuccess.data
    : undefined;
  const isPreAuthReady = presentationDetails !== undefined;

  useHeaderSecondLevel({
    title: '',
    headerShown: isPreAuthReady,
    goBack: () => {
      dismissalDialog.show();
    }
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
      <LoadingScreenContent
        contentTitle={t('wallet:presentation.loading.title')}
      >
        <Body style={{ textAlign: 'center' }}>
          {t('wallet:presentation.loading.subtitle')}
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
              organization: ISSUER_MOCK_NAME
            })}
          />
        </VStack>
        <VSpacer size={24} />
        <ListItemHeader
          label={t('wallet:credentialIssuance.trust.requiredData')}
          iconName="security"
          iconColor={theme['icon-default']}
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
            label: t('common:buttons.continue'),
            onPress: onContinue,
            loading
          },
          secondary: {
            label: t('common:buttons.cancel'),
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
