import {
  ContentWrapper,
  FooterActions,
  H1,
  VSpacer
} from '@pagopa/io-app-design-system';
import React, {useEffect} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
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

/**
 * This is the screen that shows the information about the discovery process
 * about the activation of the DIW. It uses a markdown component to render
 * the content of the screen. The screen is wrapped in a GradientScrollView
 * with a primary and secondary action.
 */
const Discovery = () => {
  const {t} = useTranslation(['wallet', 'global']);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const {error, success, loading} = useAppSelector(selectInstanceStatus);

  useEffect(() => {
    dispatch(resetInstanceStatus());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      // eslint-disable-next-line no-console
      console.log('Success');
    }
  }, [success]);

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
    <>
      <ScrollView>
        <AnimatedImage
          source={require('../../../../../assets/img/features/wallet/discovery/itw_hero.png')}
          style={styles.banner}
        />
        <VSpacer size={24} />
        <ContentWrapper>
          <H1>{t('wallet:discovery.title')}</H1>
          <VSpacer size={24} />
          <Markdown content={t('wallet:discovery.description')} />
        </ContentWrapper>
      </ScrollView>
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
    </>
  );
};

const styles = StyleSheet.create({
  banner: {resizeMode: 'cover', width: '100%'}
});

export default Discovery;
