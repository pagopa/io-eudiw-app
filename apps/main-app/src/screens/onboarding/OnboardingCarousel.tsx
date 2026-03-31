import {
  FooterActions,
  IOButton,
  IOColors,
  IOVisualCostants
} from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { ComponentProps, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Carousel } from '../../components/Carousel';
import { LandingCardComponent } from '../../components/LandingCardComponent';
import {
  FocusAwareStatusBar,
  useAppBackgroundAccentColorName
} from '@io-eudiw-app/commons';

const TEXT_COLOR = 'white';

/**
 * A screen with a carousel which shows the main features of the app.
 * It is the first screen shown to the user when the app is opened for the first time.
 * The user can skip the carousel and go to the main onboarding flow or swipe through the cards.
 */
export const OnboardingCarousel = () => {
  const navigation = useNavigation();
  const carouselRef = useRef<ScrollView>(null);
  const [step, setStep] = useState(0);
  const windowDimensions = useWindowDimensions();
  const { t } = useTranslation(['global', 'common']);
  const blueColor = useAppBackgroundAccentColorName();

  const skipCarousel = useCallback(() => {
    navigation.navigate('ROOT_ONBOARDING_NAV', {
      screen: 'ONBOARDING_PIN_CREATION',
      params: { isOnboarding: true }
    });
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
  > = useMemo(
    () => [
      {
        id: 0,
        pictogramName: 'smile',
        title: t('global:onboarding.carousel.first.title'),
        content: t('global:onboarding.carousel.first.content'),
        accessibilityLabel: t('global:onboarding.carousel.first.title'),
        accessibilityHint: t('global:onboarding.carousel.first.content'),
        titleColor: TEXT_COLOR,
        contentColor: TEXT_COLOR,
        pictogramStyle: 'light-content'
      },
      {
        id: 1,
        pictogramName: 'walletDoc',
        title: t('global:onboarding.carousel.second.title'),
        content: t('global:onboarding.carousel.second.content'),
        accessibilityLabel: t('global:onboarding.carousel.second.title'),
        accessibilityHint: t('global:onboarding.carousel.second.content'),
        titleColor: TEXT_COLOR,
        contentColor: TEXT_COLOR,
        pictogramStyle: 'light-content'
      },
      {
        id: 2,
        pictogramName: 'fingerprint',
        title: t('global:onboarding.carousel.third.title'),
        content: t('global:onboarding.carousel.third.content'),
        accessibilityLabel: t('global:onboarding.carousel.third.title'),
        accessibilityHint: t('global:onboarding.carousel.third.content'),
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
      <SafeAreaView style={styles.wrapper}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            padding: IOVisualCostants.appMarginDefault
          }}
        >
          <IOButton
            variant="link"
            testID="skip-button-onboarding-wallet"
            accessibilityLabel={t('common:buttons.skip')}
            color={'contrast'}
            label={t('common:buttons.skip')}
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
          fixed={false}
          actions={{
            primary: {
              label: t('common:buttons.next'),
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
  wrapper: {
    flex: 1,
    backgroundColor: IOColors['blueIO-500']
  }
});
