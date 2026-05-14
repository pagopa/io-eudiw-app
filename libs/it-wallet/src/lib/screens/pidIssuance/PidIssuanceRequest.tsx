import {
  Body,
  ForceScrollDownView,
  H2,
  IOVisualCostants,
  VSpacer,
  VStack
} from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import {
  useDisableGestureNavigation,
  useHeaderSecondLevel,
  useHardwareBackButtonToDismiss,
  LoadingScreenContent
} from '@io-eudiw-app/commons';
import CredentialPreviewClaimsList from '../../components/credential/CredentialPreviewClaimsList';
import { useItwDismissalDialog } from '../../hooks/useItwDismissalDialog';
import { obtainPidThunk } from '../../middleware/pid';
import { addPidWithIdentification } from '../../store/credentials';
import {
  selectPidIssuanceData,
  selectPidIssuanceStatus
} from '../../store/selectors/pidIssuance';
import { parseClaimsToRecord } from '../../utils/claims';
import { StoredCredential } from '../../utils/itwTypesUtils';
import { useAppDispatch, useAppSelector } from '../../store';
import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';

/**
 * Screen which starts and handles the PID issuance flow.
 * As soon as the screen is rendered, the PID issuance related action is dispatched and the flow stars.
 * A loading screen is shown until the PID is issued, then the user can see a preview of the PID and decide to add it to the wallet.
 * If the PID issuance fails, the user is redirected to the failure screen.
 */
const PidIssuanceRequest = () => {
  const { t } = useTranslation(['wallet', 'common']);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { error, success, loading } = useAppSelector(selectPidIssuanceStatus);
  const pid = useAppSelector(selectPidIssuanceData);
  const { navigateToWallet } = useNavigateToWalletWithReset();

  useHardwareBackButtonToDismiss(() => dismissalDialog.show());
  useDisableGestureNavigation();

  useEffect(() => {
    const promise = dispatch(obtainPidThunk());
    return () => {
      promise.abort();
    };
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
      title: t('discovery.screen.itw.dismissalDialog.title'),
      body: t('discovery.screen.itw.dismissalDialog.body'),
      confirmLabel: t('discovery.screen.itw.dismissalDialog.confirm'),
      cancelLabel: t('discovery.screen.itw.dismissalDialog.cancel')
    },
    handleDismiss: () => navigateToWallet()
  });

  const PidPreview = ({ credential }: { credential: StoredCredential }) => {
    const parsedClaims = parseClaimsToRecord(credential.parsedCredential);
    console.log(JSON.stringify(parsedClaims, null, 2));

    return (
      <ForceScrollDownView
        contentContainerStyle={styles.scroll}
        footerActions={{
          actions: {
            type: 'SingleButton',
            primary: {
              label: t('buttons.continue', {
                ns: 'common'
              }),
              onPress: () => dispatch(addPidWithIdentification({ credential }))
            }
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
    );
  };

  return (
    <>
      {loading && <LoadingScreenContent contentTitle={t('common:waiting')} />}
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
