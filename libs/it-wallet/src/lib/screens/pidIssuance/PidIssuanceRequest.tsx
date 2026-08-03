import {
  LoadingScreenContent,
  useDisableGestureNavigation,
  useHardwareBackButtonToDismiss,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
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

import CredentialPreviewClaimsList from '../../components/credential/CredentialPreviewClaimsList';
import { useItwDismissalDialog } from '../../hooks/useItwDismissalDialog';
import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';
import { useAppDispatch, useAppSelector } from '../../store';
import { addPidWithIdentification } from '../../store/credentials';
import {
  resetPidIssuance,
  setPidIssuanceRequest
} from '../../store/pidIssuance';
import {
  selectPidIssuanceData,
  selectPidIssuanceStatus
} from '../../store/selectors/pidIssuance';
import { parseClaimsToRecord } from '../../utils/claims';
import { StoredCredential } from '../../utils/itwTypesUtils';

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
  const { error, loading, success } = useAppSelector(selectPidIssuanceStatus);
  const pid = useAppSelector(selectPidIssuanceData);
  const { navigateToWallet } = useNavigateToWalletWithReset();

  useHardwareBackButtonToDismiss(() => dismissalDialog.show());
  useDisableGestureNavigation();

  useEffect(() => {
    dispatch(setPidIssuanceRequest());
    return () => {
      dispatch(resetPidIssuance());
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
    canGoBack: success.status,
    goBack: () => {
      dismissalDialog.show();
    },
    title: ''
  });

  const dismissalDialog = useItwDismissalDialog({
    customLabels: {
      body: t('discovery.screen.itw.dismissalDialog.body'),
      cancelLabel: t('discovery.screen.itw.dismissalDialog.cancel'),
      confirmLabel: t('discovery.screen.itw.dismissalDialog.confirm'),
      title: t('discovery.screen.itw.dismissalDialog.title')
    },
    handleDismiss: () => navigateToWallet()
  });

  const PidPreview = ({ credential }: { credential: StoredCredential }) => {
    const parsedClaims = parseClaimsToRecord(credential.parsedCredential);

    return (
      <ForceScrollDownView
        contentContainerStyle={styles.scroll}
        footerActions={{
          actions: {
            primary: {
              label: t('buttons.continue', {
                ns: 'common'
              }),
              onPress: () => dispatch(addPidWithIdentification({ credential }))
            },
            type: 'SingleButton'
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
  contentWrapper: {
    flexGrow: 1,
    paddingHorizontal: IOVisualCostants.appMarginDefault
  },
  scroll: {
    flexGrow: 1
  }
});
