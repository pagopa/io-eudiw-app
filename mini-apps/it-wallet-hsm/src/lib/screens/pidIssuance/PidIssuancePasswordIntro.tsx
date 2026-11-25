import {
  IOMarkdown,
  IOScrollViewWithLargeHeader,
  useDisableGestureNavigation,
  useHardwareBackButtonToDismiss,
  useHeaderSecondLevel,
  useIOBottomSheetModal
} from '@io-eudiw-app/commons';
import {
  ContentWrapper,
  FooterActions,
  IOButton,
  VSpacer
} from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import PasswordImage from '../../../assets/img/pidIssuance/password.svg';
import { useItwDismissalDialog } from '../../hooks/useItwDismissalDialog';
import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';

/**
 * Screen which introduces the HSM password, shown by the PID issuance flow before enrolling the PID key.
 * Leaving it aborts the PID issuance.
 */
const PidIssuancePasswordIntro = () => {
  const { t } = useTranslation(['hsm', 'common']);
  const navigation = useNavigation();
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
    goBack: () => dismissalDialog.show(),
    title: ''
  });

  const whyBottomSheet = useIOBottomSheetModal({
    closeAccessibilityLabel: t('common:buttons.close'),
    component: (
      <>
        <IOMarkdown content={t('pidIssuance.passwordIntro.bottomSheet.body')} />
        <VSpacer size={32} />
      </>
    ),
    footer: (
      <FooterActions
        actions={{
          primary: {
            label: t('pidIssuance.passwordIntro.bottomSheet.primaryAction'),
            onPress: () => whyBottomSheet.dismiss()
          },
          type: 'SingleButton'
        }}
      />
    ),
    title: t('pidIssuance.passwordIntro.bottomSheet.title')
  });

  return (
    <IOScrollViewWithLargeHeader
      actions={{
        primary: {
          label: t('common:buttons.continue'),
          onPress: () =>
            navigation.navigate('MAIN_WALLET_NAV', {
              screen: 'PID_ISSUANCE_PASSWORD'
            })
        },
        type: 'SingleButton'
      }}
      description={t('pidIssuance.passwordIntro.description')}
      title={{
        label: t('pidIssuance.passwordIntro.title'),
        section: t('pidIssuance.passwordIntro.section')
      }}
    >
      <ContentWrapper>
        <View style={styles.whyCta}>
          <IOButton
            label={t('pidIssuance.passwordIntro.whyCta')}
            onPress={whyBottomSheet.present}
            variant="link"
          />
        </View>
        <VSpacer size={32} />
        <View style={styles.illustration}>
          <PasswordImage height={224} width={176} />
        </View>
      </ContentWrapper>
      {whyBottomSheet.bottomSheet}
    </IOScrollViewWithLargeHeader>
  );
};

export default PidIssuancePasswordIntro;

const styles = StyleSheet.create({
  illustration: {
    alignItems: 'center'
  },
  whyCta: {
    alignItems: 'flex-start'
  }
});
