import {
  IOMarkdown,
  useDisableGestureNavigation,
  useHeaderSecondLevel,
  useIOBottomSheetModal
} from '@io-eudiw-app/commons';
import {
  Body,
  ContentWrapper,
  FooterActions,
  ForceScrollDownView,
  H2,
  IOSpacingScale,
  VSpacer,
  VStack
} from '@pagopa/io-app-design-system';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import CredentialPreviewClaimsList from '../../components/credential/CredentialPreviewClaimsList';
import { useCredentialCardConfig } from '../../components/credential/ItwCredentialCard/config';
import { ItwCredentialClaimsCard } from '../../components/credential/ItwCredentialClaimsCard';
import { useItwDismissalDialog } from '../../hooks/useItwDismissalDialog';
import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  resetCredentialIssuance,
  selectCredentialIssuancePostAuthStatus
} from '../../store/credentialIssuance';
import { addCredentialWithIdentification } from '../../store/credentials';
import { parseClaimsToRecord } from '../../utils/claims';
import { getCredentialNameByType } from '../../utils/credentials';
import { WellKnownClaim } from '../../utils/itwClaimsUtils';

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
    customLabels: {
      body: t('common:alert.body'),
      cancelLabel: t('common:alert.cancel'),
      confirmLabel: t('common:alert.confirm'),
      title: t('common:alert.title')
    },
    handleDismiss: cancel
  });

  useHeaderSecondLevel({
    goBack: () => {
      dismissalDialog.show();
    },
    title: ''
  });

  useDisableGestureNavigation();

  const cardConfig = useCredentialCardConfig(
    (credentialPostStatus.success.status
      ? credentialPostStatus.success.data?.credentialType
      : undefined) ?? ''
  );

  const somethingWrongBottomSheet = useIOBottomSheetModal({
    closeAccessibilityLabel: t('common:buttons.close'),
    component: (
      <>
        <IOMarkdown
          content={t(
            'wallet:issuance.credentialPreview.bottomSheet.somethingWrong.bodyMarkdown'
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
              'wallet:issuance.credentialPreview.bottomSheet.somethingWrong.primaryAction'
            ),
            onPress: () => somethingWrongBottomSheet.dismiss()
          },
          type: 'SingleButton'
        }}
      />
    ),
    title: t(
      'wallet:issuance.credentialPreview.bottomSheet.somethingWrong.title'
    )
  });

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
      footerActions={{
        actions: {
          primary: {
            icon: 'addSmall',
            iconPosition: 'end',
            label: t('wallet:issuance.credentialPreview.actions.primary'),
            onPress: () =>
              dispatch(
                addCredentialWithIdentification({
                  credential
                })
              )
          },
          secondary: {
            label: t(
              'wallet:issuance.credentialPreview.actions.somethingWrong'
            ),
            onPress: somethingWrongBottomSheet.present
          },
          type: 'TwoButtons'
        }
      }}
    >
      <ContentWrapper style={styles.scrollView}>
        <VStack space={8}>
          <H2>{t('wallet:issuance.credentialPreview.detailsTitle')}</H2>
          <Body>{t('wallet:issuance.credentialPreview.subtitle')}</Body>
        </VStack>
        <VSpacer size={24} />
        <ItwCredentialClaimsCard
          gradientEndColor={cardConfig.background.colors[0]}
          title={getCredentialNameByType(credential.credentialType)}
        >
          <View style={styles.body}>
            <CredentialPreviewClaimsList
              claims={parsedClaims}
              isPreview={true}
            />
          </View>
        </ItwCredentialClaimsCard>
      </ContentWrapper>
      {somethingWrongBottomSheet.bottomSheet}
    </ForceScrollDownView>
  );
};

const cardSpacing: IOSpacingScale = 16;

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: cardSpacing
  },
  scrollView: {
    flexGrow: 1
  }
});
