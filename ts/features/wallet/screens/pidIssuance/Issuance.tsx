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
  selectPidIssuance,
  selectPidIssuanceStatus,
  setPidIssuanceRequest
} from '../../store/pidIssuance';
import LoadingScreenContent from '../../../../components/LoadingScreenContent';
import CredentialPreviewClaimsList from '../../components/CredentialPreviewClaimsList';
import {StoredCredential} from '../../utils/types';
import {addPid} from '../../store/credentials';
import {Lifecycle, setLifecycle} from '../../store/lifecycle';

/**
 * Screen which shows the information about the wallet and then registers a wallet instance.
 */
const Issuance = () => {
  const {t} = useTranslation(['wallet', 'global']);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const {error, success, loading} = useAppSelector(selectPidIssuanceStatus);
  const pid = useAppSelector(selectPidIssuance);

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

  const onAdd = (pidToAdd: StoredCredential) => {
    dispatch(addPid({pid: pidToAdd}));
    dispatch(setLifecycle({lifecycle: Lifecycle.LIFECYCLE_VALID}));
    navigation.navigate('MAIN_WALLET', {screen: 'SUCCESS'});
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
            onPress: () => onAdd(credential),
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
