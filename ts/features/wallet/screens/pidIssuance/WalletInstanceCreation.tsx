import {
  ContentWrapper,
  FooterActions,
  ForceScrollDownView,
  H1,
  VSpacer
} from '@pagopa/io-app-design-system';
import React, {useEffect} from 'react';
import {StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {useHeaderSecondLevel} from '../../../../hooks/useHeaderSecondLevel';
import {AnimatedImage} from '../../../../components/AnimatedImage';
import Markdown from '../../../../components/markdown';
import {useAppDispatch, useAppSelector} from '../../../../store';
import {
  resetInstanceStatus,
  selectInstanceStatus,
  setInstanceRequest
} from '../../store/pidIssuance';
import {selectAttestation} from '../../store/attestation';

/**
 * Screen which shows the information about the wallet and then registers a wallet instance.
 */
const WalletInstanceCreation = () => {
  const {t} = useTranslation(['wallet', 'global']);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const {error, success, loading} = useAppSelector(selectInstanceStatus);
  const attestation = useAppSelector(selectAttestation);

  useEffect(() => {
    dispatch(resetInstanceStatus());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      // eslint-disable-next-line no-console
      console.log('Attestation: ', attestation);
    }
  }, [success, attestation]);

  useEffect(() => {
    if (error.status === true) {
      navigation.navigate('MAIN_WALLET', {
        screen: 'RESULT_ERROR',
        params: {key: 'INSTANCE'}
      });
    }
  }, [error, navigation]);

  useHeaderSecondLevel({
    title: ''
  });

  return (
    <ForceScrollDownView threshold={50}>
      <AnimatedImage
        source={require('../../assets/img/itw_hero.png')}
        style={styles.banner}
      />
      <VSpacer size={24} />
      <ContentWrapper>
        <H1>{t('wallet:walletInstanceCreation.title')}</H1>
        <VSpacer size={24} />
        <Markdown content={t('wallet:walletInstanceCreation.description')} />
      </ContentWrapper>
      <FooterActions
        fixed={false}
        actions={{
          type: 'SingleButton',
          primary: {
            loading,
            label: t('global:buttons.continue'),
            accessibilityLabel: t('global:buttons.continue'),
            onPress: () => dispatch(setInstanceRequest())
          }
        }}
      />
    </ForceScrollDownView>
  );
};

const styles = StyleSheet.create({
  banner: {resizeMode: 'cover', width: '100%'}
});

export default WalletInstanceCreation;
