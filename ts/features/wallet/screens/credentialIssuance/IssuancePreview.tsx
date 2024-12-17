import {
  FooterActions,
  ForceScrollDownView,
  H2,
  IOVisualCostants,
  VSpacer
} from '@pagopa/io-app-design-system';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';
import React, {useCallback} from 'react';
import {useAppDispatch, useAppSelector} from '../../../../store';
import {selectCredentialIssuancePostAuthStatus} from '../../store/credentialIssuance';
import {useHeaderSecondLevel} from '../../../../hooks/useHeaderSecondLevel';
import CredentialPreviewClaimsList from '../../components/CredentialPreviewClaimsList';

export const CredentialPreview = () => {
  const credential = useAppSelector(selectCredentialIssuancePostAuthStatus);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const {t} = useTranslation(['global', 'wallet']);

  const navigateToErrorScreen = useCallback(
    () =>
      navigation.navigate('MAIN_WALLET', {
        screen: 'WALLET_CREDENTIAL_ISSUANCE_FAILURE'
      }),
    [navigation]
  );

  useHeaderSecondLevel({
    title: ''
  });

  if (!credential.success.status || !credential.success.data) {
    // This should never happen, however we need to handle it
    navigateToErrorScreen();
    return null;
  }

  return (
    <ForceScrollDownView contentContainerStyle={styles.scrollView}>
      <View style={styles.container}>
        <H2>TEST</H2>
        <VSpacer size={24} />
        <CredentialPreviewClaimsList data={credential.success.data} />
      </View>
      <FooterActions
        fixed={false}
        actions={{
          type: 'TwoButtons',
          primary: {
            icon: 'add',
            iconPosition: 'end',
            label: 'Test',
            onPress: () => void 0
          },
          secondary: {
            label: 'Test',
            onPress: () => void 0
          }
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
