import {
  FooterActions,
  ForceScrollDownView,
  H2,
  IOVisualCostants,
  VSpacer
} from '@pagopa/io-app-design-system';
import { StyleSheet, View } from 'react-native';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../store';
import {
  resetCredentialIssuance,
  selectCredentialIssuancePostAuthStatus
} from '../../store/credentialIssuance';
import { useHeaderSecondLevel } from '../../../../hooks/useHeaderSecondLevel';
import { getCredentialNameByType } from '../../utils/credentials';
import { addCredentialWithIdentification } from '../../store/credentials';
import { useNavigateToWalletWithReset } from '../../../../hooks/useNavigateToWalletWithReset';
import CredentialPreviewClaimsList from '../../components/credential/CredentialPreviewClaimsList';
import { useItwDismissalDialog } from '../../hooks/useItwDismissalDialog';
import { useDisableGestureNavigation } from '../../../../hooks/useDisableGestureNavigation';

export const CredentialPreview = () => {
  const credentialPostStatus = useAppSelector(
    selectCredentialIssuancePostAuthStatus
  );
  const dispatch = useAppDispatch();
  const { t } = useTranslation(['wallet', 'global']);
  const { navigateToWallet } = useNavigateToWalletWithReset();

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

  if (
    !credentialPostStatus.success.status ||
    !credentialPostStatus.success.data
  ) {
    // This should never happen, however we need to handle it
    return null;
  }

  const credential = credentialPostStatus.success.data;

  return (
    <ForceScrollDownView
      contentContainerStyle={styles.scrollView}
      threshold={50}
    >
      <View style={styles.container}>
        <H2>{getCredentialNameByType(credential.credentialType)}</H2>
        <VSpacer size={24} />
        <CredentialPreviewClaimsList data={credential} isPreview={true} />
      </View>
      <FooterActions
        fixed={false}
        actions={{
          primary: {
            label: t('global:buttons.continue'),
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
            label: t('global:buttons.cancel'),
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
