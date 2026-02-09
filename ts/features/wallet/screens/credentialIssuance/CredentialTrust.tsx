import {
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
import { Fragment, useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { getCredentialNameByType } from '../../utils/credentials';
import { useHeaderSecondLevel } from '../../../../hooks/useHeaderSecondLevel';
import {
  resetCredentialIssuance,
  selectCredentialIssuancePostAuthStatus,
  selectCredentialIssuancePreAuthStatus,
  selectRequestedCredentialType,
  setCredentialIssuancePostAuthRequest
} from '../../store/credentialIssuance';
import { useNavigateToWalletWithReset } from '../../../../hooks/useNavigateToWalletWithReset';
import { useItwDismissalDialog } from '../../hooks/useItwDismissalDialog';
import { useDisableGestureNavigation } from '../../../../hooks/useDisableGestureNavigation';
import IOMarkdown from '../../../../components/IOMarkdown';
import { ISSUER_MOCK_NAME } from '../../utils/itwMocksUtils';
import { ItwDataExchangeIcons } from '../../components/ItwDataExchangeIcons';
import { getCredentialNameFromType } from '../../utils/itwCredentialUtils';
import { ItwRequestedClaimsList } from '../../components/presentation/ItwRequiredClaimsList';

/**
 * Screen which shows the user the credentials and claims that will be shared with the credential issuer
 * in order to obtain the requisted credential.
 */
const CredentialTrust = () => {
  const dispatch = useAppDispatch();
  const { success: preAuthSuccess } = useAppSelector(
    selectCredentialIssuancePreAuthStatus
  );
  const { t } = useTranslation(['global', 'wallet']);
  const { loading, error, success } = useAppSelector(
    selectCredentialIssuancePostAuthStatus
  );
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

  const presentationDetails = preAuthSuccess.status
    ? preAuthSuccess.data
    : undefined;
  const requiredClaimsByCredential = presentationDetails?.map(detail =>
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
        {requiredClaimsByCredential?.map((requiredClaims, index) => (
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
