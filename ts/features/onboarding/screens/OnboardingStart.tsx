import * as React from 'react';
import {
  Body,
  FooterActions,
  H3,
  IOStyles,
  Pictogram,
  VSpacer
} from '@pagopa/io-app-design-system';
import {SafeAreaView, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useHeaderSecondLevel} from '../../../hooks/useHeaderSecondLevel';

/**
 * Onboarding screen which is shown after the initial carousel.
 * It has a button to start the PIN creation process.
 */
const OnboardingStart = () => {
  const navigation = useNavigation();
  const {t} = useTranslation(['global', 'onboarding']);

  useHeaderSecondLevel({
    title: '',
    goBack: () => navigation.goBack()
  });

  const onStartPress = () =>
    navigation.navigate('ROOT_ONBOARDING_NAV', {
      screen: 'ONBOARDING_PIN_CREATION',
      params: {isOnboarding: true}
    });

  return (
    <SafeAreaView style={IOStyles.flex}>
      <View
        style={[IOStyles.alignCenter, IOStyles.flex, IOStyles.centerJustified]}>
        <View style={IOStyles.alignCenter}>
          <Pictogram name="cie" size={180} />
          <VSpacer size={24} />
          <H3 style={styles.text}>{t('onboarding:start.title')}</H3>
          <VSpacer size={8} />
          <Body style={styles.text}>{t('onboarding:start.subtitle')}</Body>
        </View>
      </View>
      <FooterActions
        actions={{
          primary: {
            label: t('global:buttons.start'),
            onPress: onStartPress
          },
          type: 'SingleButton'
        }}
      />
    </SafeAreaView>
  );
};

export default OnboardingStart;

const styles = StyleSheet.create({
  text: {textAlign: 'center'}
});
