import {
  LoadingScreenContent,
  useDisableGestureNavigation,
  useHardwareBackButtonToDismiss,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
import {
  Body,
  BodySmall,
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
import MAIN_ROUTES from '../../navigation/main/routes';
import PID_ISSUANCE_ROUTES from '../../navigation/pidIssuance/routes';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  addPidWithIdentification,
  itwCredentialsPidSelector
} from '../../store/credentials';
import {
  resetPidIssuance,
  setPidIssuanceRequest
} from '../../store/pidIssuance';
import {
  selectPendingCredential,
  selectPidIssuanceData,
  selectPidIssuanceStatus
} from '../../store/selectors/pidIssuance';
import { parseClaimsToRecord } from '../../utils/claims';

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
  const isPidStored = useAppSelector(itwCredentialsPidSelector) !== undefined;
  const pendingCredential = useAppSelector(selectPendingCredential);
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
      navigation.navigate(MAIN_ROUTES.PID_ISSUANCE_NAV, {
        screen: PID_ISSUANCE_ROUTES.FAILURE
      });
    }
  }, [error, navigation]);

  useEffect(() => {
    if (isPidStored && !pendingCredential) {
      navigation.navigate(MAIN_ROUTES.PID_ISSUANCE_NAV, {
        screen: PID_ISSUANCE_ROUTES.RESULT
      });
    }
  }, [isPidStored, pendingCredential, navigation]);

  useHeaderSecondLevel({
    canGoBack: success.status,
    goBack: () => {
      dismissalDialog.show();
    },
    title: ''
  });

  const parsedClaims = pid
    ? parseClaimsToRecord(pid.parsedCredential)
    : undefined;

  return (
    <>
      {loading && (
        <LoadingScreenContent
          contentTitle={t('common:waiting')}
          headerVisible
        />
      )}
      {success.status === true && pid && parsedClaims && (
        <ForceScrollDownView
          contentContainerStyle={styles.scroll}
          footerActions={{
            actions: {
              primary: {
                label: t('buttons.continue', {
                  ns: 'common'
                }),
                onPress: () =>
                  dispatch(addPidWithIdentification({ credential: pid }))
              },
              secondary: {
                label: t('pidIssuance.preview.cancel'),
                onPress: () => dismissalDialog.show()
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
            <VSpacer size={16} />
            <BodySmall color="grey-700">
              {t('pidIssuance.preview.upgradeNotice')}
            </BodySmall>
          </VStack>
        </ForceScrollDownView>
      )}
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
