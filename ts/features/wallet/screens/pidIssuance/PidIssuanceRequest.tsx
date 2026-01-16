import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import {
  Body,
  ForceScrollDownView,
  H2,
  IOVisualCostants,
  VSpacer,
  VStack
} from '@pagopa/io-app-design-system';
import { StyleSheet, View } from 'react-native';
import I18n from 'i18next';
import { useHeaderSecondLevel } from '../../../../hooks/useHeaderSecondLevel';
import { useAppDispatch, useAppSelector } from '../../../../store';
import {
  selectPidIssuanceData,
  selectPidIssuanceStatus,
  setPidIssuanceRequest
} from '../../store/pidIssuance';
import LoadingScreenContent from '../../../../components/LoadingScreenContent';
import CredentialPreviewClaimsList from '../../components/credential/CredentialPreviewClaimsList';
import { addPidWithIdentification } from '../../store/credentials';
import { useHardwareBackButtonToDismiss } from '../../../../hooks/useHardwareBackButton';
import { useItwDismissalDialog } from '../../hooks/useItwDismissalDialog';
import { useDisableGestureNavigation } from '../../../../hooks/useDisableGestureNavigation';
import { useNavigateToWalletWithReset } from '../../../../hooks/useNavigateToWalletWithReset';
import { StoredCredential } from '../../utils/itwTypesUtils';

/**
 * Screen which starts and handles the PID issuance flow.
 * As soon as the screen is rendered, the PID issuance related action is dispatched and the flow stars.
 * A loading screen is shown until the PID is issued, then the user can see a preview of the PID and decide to add it to the wallet.
 * If the PID issuance fails, the user is redirected to the failure screen.
 */
const PidIssuanceRequest = () => {
  const { t } = useTranslation(['wallet', 'global']);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { error, success, loading } = useAppSelector(selectPidIssuanceStatus);
  const pid = useAppSelector(selectPidIssuanceData);
  const { navigateToWallet } = useNavigateToWalletWithReset();

  useHardwareBackButtonToDismiss(() => dismissalDialog.show());
  useDisableGestureNavigation();

  useEffect(() => {
    dispatch(setPidIssuanceRequest());
  }, [dispatch]);

  useEffect(() => {
    if (error.status === true) {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'PID_ISSUANCE_FAILURE'
      });
    }
  }, [error, navigation]);

  useHeaderSecondLevel({
    title: '',
    canGoBack: success.status,
    goBack: () => {
      dismissalDialog.show();
    }
  });

  const dismissalDialog = useItwDismissalDialog({
    customLabels: {
      title: I18n.t('discovery.screen.itw.dismissalDialog.title', {
        ns: 'wallet'
      }),
      body: I18n.t('discovery.screen.itw.dismissalDialog.body', {
        ns: 'wallet'
      }),
      confirmLabel: I18n.t('discovery.screen.itw.dismissalDialog.confirm', {
        ns: 'wallet'
      }),
      cancelLabel: I18n.t('discovery.screen.itw.dismissalDialog.cancel', {
        ns: 'wallet'
      })
    },
    handleDismiss: () => navigateToWallet()
  });

  const PidPreview = ({ credential }: { credential: StoredCredential }) => (
    <>
      <ForceScrollDownView
        contentContainerStyle={styles.scroll}
        footerActions={{
          actions: {
            type: 'SingleButton',
            primary: {
              label: I18n.t('buttons.continue', {
                ns: 'global'
              }),
              onPress: () => dispatch(addPidWithIdentification({ credential }))
            }
          }
        }}
      >
        <VStack style={styles.contentWrapper}>
          <H2>{t('wallet:pidIssuance.preview.title')}</H2>
          <VSpacer size={16} />
          <Body>{t('wallet:pidIssuance.preview.subtitle')}</Body>
          <VSpacer size={24} />
          <View>
            <CredentialPreviewClaimsList data={credential} isPreview={true} />
          </View>
        </VStack>
      </ForceScrollDownView>
    </>
  );

  return (
    <>
      {loading && (
        <LoadingScreenContent contentTitle={t('global:generics.waiting')} />
      )}
      {success.status === true && pid && <PidPreview credential={pid} />}
    </>
  );
};

export default PidIssuanceRequest;

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1
  },
  contentWrapper: {
    flexGrow: 1,
    paddingHorizontal: IOVisualCostants.appMarginDefault
  }
});
