import {
  FooterActions,
  ForceScrollDownView,
  H2,
  IOVisualCostants,
  VSpacer
} from '@pagopa/io-app-design-system';
import {StyleSheet, View} from 'react-native';
import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {useAppDispatch, useAppSelector} from '../../../../store';
import {
  resetCredentialIssuance,
  selectCredentialIssuancePostAuthStatus
} from '../../store/credentialIssuance';
import {useHeaderSecondLevel} from '../../../../hooks/useHeaderSecondLevel';
import {getCredentialNameByType} from '../../utils/credentials';
import {addCredentialWithIdentification} from '../../store/credentials';
import {useNavigateToWalletWithReset} from '../../../../hooks/useNavigateToWalletWithReset';
import CredentialPreviewClaimsList from '../../components/credential/CredentialPreviewClaimsList';

export const CredentialPreview = () => {
  const credentialPostStatus = useAppSelector(
    selectCredentialIssuancePostAuthStatus
  );
  const dispatch = useAppDispatch();
  const {t} = useTranslation(['wallet', 'global']);
  const {navigateToWallet} = useNavigateToWalletWithReset();

  const cancel = useCallback(() => {
    dispatch(resetCredentialIssuance());
    navigateToWallet();
  }, [dispatch, navigateToWallet]);

  useHeaderSecondLevel({
    title: ''
  });

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
      threshold={50}>
      <View style={styles.container}>
        <H2>{getCredentialNameByType(credential.credentialType)}</H2>
        <VSpacer size={24} />
        <CredentialPreviewClaimsList data={credential} isPreview={true} />
      </View>
      <FooterActions
        fixed={false}
        actions={{
          primary: {
            label: t('wallet:pidIssuance.preview.button'),
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
            onPress: cancel
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
