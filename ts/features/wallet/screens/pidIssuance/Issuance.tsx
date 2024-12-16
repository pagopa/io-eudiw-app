import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {
  FooterActions,
  ForceScrollDownView,
  H2,
  IOVisualCostants,
  VSpacer,
  VStack
} from '@pagopa/io-app-design-system';
import {StyleSheet, View} from 'react-native';
import {useHeaderSecondLevel} from '../../../../hooks/useHeaderSecondLevel';
import {useAppDispatch, useAppSelector} from '../../../../store';
import {
  selectPidIssuanceData,
  selectPidIssuanceStatus,
  setPidIssuanceRequest
} from '../../store/pidIssuance';
import LoadingScreenContent from '../../../../components/LoadingScreenContent';
import CredentialPreviewClaimsList from '../../components/CredentialPreviewClaimsList';
import {StoredCredential} from '../../utils/types';
import {addPidWithIdentification} from '../../store/credentials';

/**
 * Screen which starts and handles the PID issuance flow.
 * As soon as the screen is rendered, the PID issuance related action is dispatched and the flow stars.
 * A loading screen is shown until the PID is issued, then the user can see a preview of the PID and decide to add it to the wallet.
 * If the PID issuance fails, the user is redirected to the failure screen.
 */
const Issuance = () => {
  const {t} = useTranslation(['wallet', 'global']);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const {error, success, loading} = useAppSelector(selectPidIssuanceStatus);
  const pid = useAppSelector(selectPidIssuanceData);

  useEffect(() => {
    dispatch(setPidIssuanceRequest());
  }, [dispatch]);

  useEffect(() => {
    if (error.status === true) {
      navigation.navigate('MAIN_WALLET', {
        screen: 'FAILURE'
      });
    }
  }, [error, navigation]);

  useHeaderSecondLevel({
    title: '',
    canGoBack: success.status
  });

  const onCancel = () => {
    navigation.navigate('MAIN_TAB_NAV');
  };

  const PidPreview = ({credential}: {credential: StoredCredential}) => (
    <>
      <ForceScrollDownView contentContainerStyle={styles.scroll}>
        <VStack style={styles.contentWrapper}>
          <H2>{t('wallet:pidIssuance.preview.title')}</H2>
          <H2>{t('wallet:pidIssuance.preview.subtitle')}</H2>
          <VSpacer size={24} />
          <View>
            <CredentialPreviewClaimsList data={credential} />
          </View>
        </VStack>
      </ForceScrollDownView>
      <FooterActions
        actions={{
          primary: {
            label: t('wallet:pidIssuance.preview.button'),
            onPress: () =>
              dispatch(addPidWithIdentification({pid: credential})),
            icon: 'add',
            iconPosition: 'end'
          },
          secondary: {
            label: t('global:buttons.cancel'),
            onPress: onCancel
          },
          type: 'TwoButtons'
        }}
      />
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

export default Issuance;

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1
  },
  contentWrapper: {
    flexGrow: 1,
    paddingHorizontal: IOVisualCostants.appMarginDefault
  }
});