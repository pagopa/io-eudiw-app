import {
  FooterActions,
  ForceScrollDownView,
  H2,
  IOVisualCostants,
  VSpacer
} from '@pagopa/io-app-design-system';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import {
  useDisableGestureNavigation,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
import CredentialPreviewClaimsList from '../../components/credential/CredentialPreviewClaimsList';
import { useItwDismissalDialog } from '../../hooks/useItwDismissalDialog';
import {
  resetCredentialIssuance,
  selectCredentialIssuancePostAuthStatus
} from '../../store/credentialIssuance';
import { addCredentialWithIdentification } from '../../store/credentials';
import { parseClaimsToRecord } from '../../utils/claims';
import { getCredentialNameByType } from '../../utils/credentials';
import { WellKnownClaim } from '../../utils/itwClaimsUtils';
import { useAppDispatch, useAppSelector } from '../../store';
import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';

export const CredentialPreview = () => {
  const credentialPostStatus = useAppSelector(
    selectCredentialIssuancePostAuthStatus
  );
  const dispatch = useAppDispatch();
  const { t } = useTranslation(['wallet', 'common']);
  const { navigateToWallet } = useNavigateToWalletWithReset();

  const cancel = useCallback(() => {
    dispatch(resetCredentialIssuance());
    navigateToWallet();
  }, [dispatch, navigateToWallet]);

  const dismissalDialog = useItwDismissalDialog({
    handleDismiss: cancel,
    customLabels: {
      title: t('common:alert.title'),
      body: t('common:alert.body'),
      confirmLabel: t('common:alert.confirm'),
      cancelLabel: t('common:alert.cancel')
    }
  });

  useHeaderSecondLevel({
    title: '',
    goBack: () => {
      dismissalDialog.show();
    }
  });

  useDisableGestureNavigation();

  if (
    !credentialPostStatus.success.status ||
    !credentialPostStatus.success.data
  ) {
    // This should never happen, however we need to handle it
    return null;
  }

  const credential = credentialPostStatus.success.data;
  const parsedClaims = parseClaimsToRecord(credential.parsedCredential, {
    exclude: [WellKnownClaim.unique_id, WellKnownClaim.content]
  });

  return (
    <ForceScrollDownView
      contentContainerStyle={styles.scrollView}
      threshold={50}
    >
      <View style={styles.container}>
        <H2>{getCredentialNameByType(credential.credentialType)}</H2>
        <VSpacer size={24} />
        <CredentialPreviewClaimsList claims={parsedClaims} isPreview={true} />
      </View>
      <FooterActions
        fixed={false}
        actions={{
          primary: {
            label: t('common:buttons.continue'),
            onPress: () =>
              dispatch(
                addCredentialWithIdentification({
                  credential
                })
              ),
            icon: 'add',
            iconPosition: 'end'
          },
          secondary: {
            label: t('common:buttons.cancel'),
            onPress: () => {
              dismissalDialog.show();
            }
          },
          type: 'TwoButtons'
        }}
      />
    </ForceScrollDownView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1
  },
  container: {
    flex: 1,
    marginHorizontal: IOVisualCostants.appMarginDefault
  }
});
