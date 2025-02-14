import React, {ComponentProps, useCallback} from 'react';
import {ScrollView, StyleSheet, useWindowDimensions, View} from 'react-native';
import {
  ButtonLink,
  FooterActions,
  IOColors,
  IOStyles
} from '@pagopa/io-app-design-system';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {Carousel} from '../../../components/Carousel';
import {LandingCardComponent} from '../../../components/LandingCardComponent';
import {useAppBackgroundAccentColorName} from '../../../hooks/theme';
import FocusAwareStatusBar from '../../../components/FocusAwareStatusBar';

const TEXT_COLOR = 'white';

/**
 * A screen with a carousel which shows the main features of the app.
 * It is the first screen shown to the user when the app is opened for the first time.
 * The user can skip the carousel and go to the main onboarding flow or swipe through the cards.
 */
export const OnboardingCarousel = () => {
  const navigation = useNavigation();
  const carouselRef = React.useRef<ScrollView>(null);
  const [step, setStep] = React.useState(0);
  const windowDimensions = useWindowDimensions();
  const {t} = useTranslation(['global', 'onboarding']);
  const blueColor = useAppBackgroundAccentColorName();

  const skipCarousel = useCallback(() => {
    navigation.navigate('ROOT_ONBOARDING_NAV', {screen: 'ONBOARDING_START'});
  }, [navigation]);

  const nextStep = useCallback(() => {
    if (step === 2) {
      skipCarousel();
    } else {
      carouselRef.current?.scrollTo({
        x: windowDimensions.width * (step + 1),
        animated: true
      });
    }
  }, [step, windowDimensions.width, skipCarousel]);

  const carouselCards: ReadonlyArray<
    ComponentProps<typeof LandingCardComponent>
  > = React.useMemo(
    () => [
      {
        id: 0,
        pictogramName: 'smile',
        title: t('onboarding:carousel.first.title'),
        content: t('onboarding:carousel.first.content'),
        accessibilityLabel: t('onboarding:carousel.first.title'),
        accessibilityHint: t('onboarding:carousel.first.content'),
        titleColor: TEXT_COLOR,
        contentColor: TEXT_COLOR,
        pictogramStyle: 'light-content'
      },
      {
        id: 1,
        pictogramName: 'walletDoc',
        title: t('onboarding:carousel.second.title'),
        content: t('onboarding:carousel.second.content'),
        accessibilityLabel: t('onboarding:carousel.second.title'),
        accessibilityHint: t('onboarding:carousel.second.content'),
        titleColor: TEXT_COLOR,
        contentColor: TEXT_COLOR,
        pictogramStyle: 'light-content'
      },
      {
        id: 2,
        pictogramName: 'fingerprint',
        title: t('onboarding:carousel.third.title'),
        content: t('onboarding:carousel.third.content'),
        accessibilityLabel: t('onboarding:carousel.third.title'),
        accessibilityHint: t('onboarding:carousel.third.content'),
        titleColor: TEXT_COLOR,
        contentColor: TEXT_COLOR,
        pictogramStyle: 'light-content'
      }
    ],
    [t]
  );
  return (
    <>
      <FocusAwareStatusBar
        backgroundColor={blueColor}
        barStyle={'light-content'}
      />
      <SafeAreaView style={[IOStyles.flex, styles.wrapper]}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            padding: IOStyles.horizontalContentPadding.paddingHorizontal
          }}>
          <ButtonLink
            testID="skip-button-onboarding-wallet"
            accessibilityLabel="features.itWallet.onboarding.skip"
            color={'contrast'}
            label={t('global:buttons.skip')}
            onPress={skipCarousel}
          />
        </View>
        <Carousel
          carouselCards={carouselCards}
          dotColor={IOColors.white}
          scrollViewRef={carouselRef}
          setStep={setStep}
        />
        <FooterActions
          actions={{
            primary: {
              label: t('global:buttons.next'),
              onPress: nextStep,
              color: 'contrast'
            },
            type: 'SingleButton'
          }}
          transparent
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  wrapper: {backgroundColor: IOColors['blueIO-500']}
});
