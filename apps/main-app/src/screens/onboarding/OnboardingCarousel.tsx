import {
  FocusAwareStatusBar,
  useAppBackgroundAccentColorName
} from '@io-eudiw-app/commons';
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
      params: { isOnboarding: true },
      screen: 'ONBOARDING_PIN_CREATION'
    });
  }, [navigation]);

  const nextStep = useCallback(() => {
    if (step === 2) {
      skipCarousel();
    } else {
      carouselRef.current?.scrollTo({
        animated: true,
        x: windowDimensions.width * (step + 1)
      });
    }
  }, [step, windowDimensions.width, skipCarousel]);

  const carouselCards: readonly ComponentProps<typeof LandingCardComponent>[] =
    useMemo(
      () => [
        {
          accessibilityHint: t('global:onboarding.carousel.first.content'),
          accessibilityLabel: t('global:onboarding.carousel.first.title'),
          content: t('global:onboarding.carousel.first.content'),
          contentColor: TEXT_COLOR,
          id: 0,
          pictogramName: 'smile',
          pictogramStyle: 'light-content',
          title: t('global:onboarding.carousel.first.title'),
          titleColor: TEXT_COLOR
        },
        {
          accessibilityHint: t('global:onboarding.carousel.second.content'),
          accessibilityLabel: t('global:onboarding.carousel.second.title'),
          content: t('global:onboarding.carousel.second.content'),
          contentColor: TEXT_COLOR,
          id: 1,
          pictogramName: 'walletDoc',
          pictogramStyle: 'light-content',
          title: t('global:onboarding.carousel.second.title'),
          titleColor: TEXT_COLOR
        },
        {
          accessibilityHint: t('global:onboarding.carousel.third.content'),
          accessibilityLabel: t('global:onboarding.carousel.third.title'),
          content: t('global:onboarding.carousel.third.content'),
          contentColor: TEXT_COLOR,
          id: 2,
          pictogramName: 'fingerprint',
          pictogramStyle: 'light-content',
          title: t('global:onboarding.carousel.third.title'),
          titleColor: TEXT_COLOR
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
            accessibilityLabel={t('common:buttons.skip')}
            color={'contrast'}
            label={t('common:buttons.skip')}
            onPress={skipCarousel}
            testID="skip-button-onboarding-wallet"
            variant="link"
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
              color: 'contrast',
              label: t('common:buttons.next'),
              onPress: nextStep
            },
            type: 'SingleButton'
          }}
          fixed={false}
          transparent
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: IOColors['blueIO-500'],
    flex: 1
  }
});
