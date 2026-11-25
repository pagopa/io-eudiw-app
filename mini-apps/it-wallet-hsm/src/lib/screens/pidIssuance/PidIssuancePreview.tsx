import {
  IOMarkdown,
  LoadingScreenContent,
  useDisableGestureNavigation,
  useHardwareBackButtonToDismiss,
  useHeaderSecondLevel,
  useIOBottomSheetModal
} from '@io-eudiw-app/commons';
import {
  Body,
  FooterActions,
  ForceScrollDownView,
  H2,
  IOVisualCostants,
  VSpacer,
  VStack
} from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import CredentialPreviewClaimsList from '../../components/credential/CredentialPreviewClaimsList';
import { useItwDismissalDialog } from '../../hooks/useItwDismissalDialog';
import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';
import { useAppDispatch, useAppSelector } from '../../store';
import { addPidWithIdentification } from '../../store/credentials';
import {
  selectPidIssuanceData,
  selectPidIssuanceStatus
} from '../../store/selectors/pidIssuance';
import { parseClaimsToRecord } from '../../utils/claims';

/**
 * Screen shown once the HSM password has been set.
 * A loading screen is shown until the PID is issued, then the user can see a preview of the PID and decide to add it to the wallet.
 * The issuance flow is owned by the PidIssuanceRequest screen, which stays mounted below this one and handles the failure and result navigation.
 */
const PidIssuancePreview = () => {
  const { t } = useTranslation(['hsm', 'common']);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { loading, success } = useAppSelector(selectPidIssuanceStatus);
  const pid = useAppSelector(selectPidIssuanceData);
  const { navigateToWallet } = useNavigateToWalletWithReset();

  const dismissalDialog = useItwDismissalDialog({
    customLabels: {
      body: t('discovery.screen.itw.dismissalDialog.body'),
      cancelLabel: t('discovery.screen.itw.dismissalDialog.cancel'),
      confirmLabel: t('discovery.screen.itw.dismissalDialog.confirm'),
      title: t('discovery.screen.itw.dismissalDialog.title')
    },
    handleDismiss: () => navigateToWallet()
  });

  useHardwareBackButtonToDismiss(() => {
    if (navigation.isFocused()) {
      dismissalDialog.show();
    }
  });
  useDisableGestureNavigation();
  useHeaderSecondLevel({
    canGoBack: success.status,
    goBack: () => {
      dismissalDialog.show();
    },
    title: ''
  });

  const somethingWrongBottomSheet = useIOBottomSheetModal({
    closeAccessibilityLabel: t('common:buttons.close'),
    component: (
      <>
        <IOMarkdown
          content={t(
            'issuance.credentialPreview.bottomSheet.somethingWrong.bodyMarkdown'
          )}
        />
        <VSpacer size={32} />
      </>
    ),
    footer: (
      <FooterActions
        actions={{
          primary: {
            label: t(
              'issuance.credentialPreview.bottomSheet.somethingWrong.primaryAction'
            ),
            onPress: () => somethingWrongBottomSheet.dismiss()
          },
          type: 'SingleButton'
        }}
      />
    ),
    title: t('issuance.credentialPreview.bottomSheet.somethingWrong.title')
  });

  const parsedClaims = pid
    ? parseClaimsToRecord(pid.parsedCredential)
    : undefined;

  return (
    <>
      {loading && (
        <LoadingScreenContent
          contentTitle={t('pidIssuance.loading')}
          headerVisible
        />
      )}
      {success.status === true && pid && parsedClaims && (
        <ForceScrollDownView
          contentContainerStyle={styles.scroll}
          footerActions={{
            actions: {
              primary: {
                label: t('pidIssuance.preview.confirm'),
                onPress: () =>
                  dispatch(addPidWithIdentification({ credential: pid }))
              },
              secondary: {
                label: t('pidIssuance.preview.somethingWrong'),
                onPress: somethingWrongBottomSheet.present
              },
              type: 'TwoButtons'
            }
          }}
        >
          <VStack style={styles.contentWrapper}>
            <H2>{t('pidIssuance.preview.title')}</H2>
            <VSpacer size={16} />
            <Body>{t('pidIssuance.preview.subtitle')}</Body>
            <VSpacer size={24} />
            <View>
              <CredentialPreviewClaimsList
                claims={parsedClaims}
                isPreview={true}
              />
            </View>
          </VStack>
        </ForceScrollDownView>
      )}
      {somethingWrongBottomSheet.bottomSheet}
    </>
  );
};

export default PidIssuancePreview;

const styles = StyleSheet.create({
  contentWrapper: {
    flexGrow: 1,
    paddingHorizontal: IOVisualCostants.appMarginDefault
  },
  scroll: {
    flexGrow: 1
  }
});
