/* eslint-disable functional/immutable-data */
import {
  ContentWrapper,
  FooterActions,
  IOButton,
  NumberPad,
  Pictogram,
  VSpacer
} from '@pagopa/io-app-design-system';
import {useCallback, useRef, useState} from 'react';
import {View, Alert, StyleSheet} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {StackScreenProps} from '@react-navigation/stack';
import {pinSet} from '../../store/reducers/pin';
import {preferencesSetIsOnboardingDone} from '../../store/reducers/preferences';
import {isValidPinNumber, PIN_LENGTH} from '../../utils/pin';
import {PinString} from '../../features/onboarding/types/PinString';
import {CarouselFlat} from '../../components/CarouselFlat';
import {useHeaderSecondLevel} from '../../hooks/useHeaderSecondLevel';
import {isDevEnv} from '../../utils/env';
import {
  selectStartupBiometricState,
  selectStartupHasScreenLock
} from '../../store/reducers/startup';
import {OnboardingNavigatorParamsList} from '../../features/onboarding/navigation/OnboardingNavigator';
import {useAppDispatch, useAppSelector} from '../../store';
import usePinValidationBottomSheet from '../../features/onboarding/hooks/usePinValidationBottomSheet';
import {PinCarouselItem, PinCarouselItemProps} from './PinCarouselItem';

const CREATION_INDEX = 0;
const CONFIRMATION_INDEX = 1;
const DEFAULT_PIN = '162534';

export type PinCreationProps = {
  isOnboarding?: boolean;
};

export type PinCreationScreenProps = StackScreenProps<
  OnboardingNavigatorParamsList,
  'ONBOARDING_PIN_CREATION'
>;

type PinMode = 'creation' | 'confirmation';

/**
 * The Pin Creation component is used in both the onboarding
 * process and the profile settings.
 * This component will allow the user to create a new pin or change the existing one.
 */
export const PinCreation = ({route}: PinCreationScreenProps) => {
  const isOnboarding = route.params.isOnboarding ?? false;
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [pin, setPin] = useState('');
  const [pinConfirmation, setPinConfirmation] = useState('');
  const pinModeRef = useRef<PinMode>('creation');
  const pinRef = useRef<string | null>(null);
  const carouselRef = useRef<FlatList>(null);
  const titleCreationRef = useRef<View>(null);
  const titleConfirmationRef = useRef<View>(null);
  const {present, bottomSheet} = usePinValidationBottomSheet();
  const {t} = useTranslation(['global', 'onboarding']);
  const biometricState = useAppSelector(selectStartupBiometricState);
  const hasDeviceScreenLock = useAppSelector(selectStartupHasScreenLock);

  const handleSubmit = useCallback(
    (pinParam: PinString) => {
      dispatch(pinSet(pinParam));

      /* If an onboarding flow is in progress, we need to navigate to the next screen based on the biometric state
       * the onboarding flow will continue in the respective biometric screen.
       */
      if (isOnboarding) {
        if (biometricState === 'Available') {
          navigation.navigate('ROOT_ONBOARDING_NAV', {
            screen: 'ONBOARDING_BIOMETRIC_AVAILABLE'
          });
          return;
        } else {
          if (!hasDeviceScreenLock) {
            navigation.navigate('ROOT_ONBOARDING_NAV', {
              screen: 'ONBOARDING_BIOMETRIC_NO_SCREEN_LOCK'
            });
            return;
          }
          if (biometricState === 'NotEnrolled') {
            navigation.navigate('ROOT_ONBOARDING_NAV', {
              screen: 'ONBOARDING_BIOMETRIC_NOT_ENROLLED'
            });
            return;
          }
          // Biometric is not supported, just finish the onboarding
          dispatch(preferencesSetIsOnboardingDone());
        }
      }
    },
    [biometricState, dispatch, hasDeviceScreenLock, isOnboarding, navigation]
  );

  const scrollToCreation = useCallback(() => {
    setPin('');

    pinModeRef.current = 'creation';
    carouselRef.current?.scrollToIndex({
      animated: true,
      index: CREATION_INDEX
    });
  }, []);
  const scrollToConfirmation = useCallback(() => {
    setPinConfirmation('');
    pinModeRef.current = 'confirmation';
    carouselRef.current?.scrollToIndex({
      animated: true,
      index: CONFIRMATION_INDEX
    });
  }, []);

  const goBack = useCallback(() => {
    if (pinModeRef.current === 'confirmation') {
      /**
       * Scrolls back to pin creation section
       */
      scrollToCreation();
    } else {
      navigation.goBack();
    }
  }, [navigation, scrollToCreation]);

  const getCurrentSetState = useCallback(
    (updateValue: (prev: string) => string) =>
      pinModeRef.current === 'creation'
        ? setPin(updateValue)
        : setPinConfirmation(updateValue),
    []
  );

  const handlePinChange = useCallback(
    (value: number) =>
      getCurrentSetState((prev: string) =>
        prev.length < PIN_LENGTH ? `${prev}${value}` : prev
      ),
    [getCurrentSetState]
  );

  const onDeletePress = useCallback(
    () => getCurrentSetState((prev: string) => prev.slice(0, -1)),
    [getCurrentSetState]
  );

  const insertValidPin = useCallback(() => {
    if (pinModeRef.current === 'creation') {
      setPin(DEFAULT_PIN);
    } else {
      setPinConfirmation(DEFAULT_PIN);
    }
  }, []);

  const handlePinCreation = useCallback(
    (v: string) => {
      const isValid = isValidPinNumber(v);

      if (isValid) {
        /**
         * pinRef is used to avoid having to pass pin as a dependency of useCallback around `handlePinConfirmation`.
         */

        pinRef.current = v;
        scrollToConfirmation();
      } else {
        Alert.alert(
          t('onboarding:pin.errors.invalid.title'),
          t('onboarding:pin.errors.invalid.description'),
          [
            {
              text: t('onboarding:pin.errors.invalid.cta')
            }
          ]
        );
      }

      return isValid;
    },
    [scrollToConfirmation, t]
  );

  const handlePinConfirmation = useCallback(
    (v: string) => {
      const isValid = v === pinRef.current;

      if (isValid) {
        handleSubmit(v as PinString);
      } else {
        // trackPinError("confirm", getFlowType(isOnboarding, isFirstOnBoarding));
        Alert.alert(t('onboarding:pin.errors.match.title'), undefined, [
          {
            text: t('onboarding:pin.errors.match.cta'),
            onPress: scrollToCreation
          }
        ]);
      }

      return isValid;
    },
    [handleSubmit, scrollToCreation, t]
  );

  const data: Array<PinCarouselItemProps> = [
    {
      title: t('onboarding:pin.title'),
      titleRef: titleCreationRef,
      description: t('onboarding:pin.subTitle'),
      value: pin,
      testID: 'create-pin-carousel-item',
      handleOnValidate: handlePinCreation,
      onValueChange: setPin,
      maxLength: PIN_LENGTH
    },
    {
      title: t('onboarding:pin.confirmation.title'),
      titleRef: titleConfirmationRef,
      value: pinConfirmation,
      testID: 'confirm-pin-carousel-item',
      handleOnValidate: handlePinConfirmation,
      onValueChange: setPinConfirmation,
      maxLength: PIN_LENGTH
    }
  ];

  useHeaderSecondLevel({
    title: '',
    goBack
  });

  return (
    <SafeAreaView testID="pin-creation-screen" style={styles.container}>
      <View style={styles.content}>
        <VSpacer size={8} />
        <View style={styles.pictogram}>
          <Pictogram name="key" size={64} />
        </View>
        <VSpacer size={8} />
        <CarouselFlat
          ref={carouselRef}
          testID="pin-creation-carousel"
          style={{flexGrow: 0}}
          data={data}
          Component={PinCarouselItem}
          scrollEnabled={false}
        />
        <VSpacer size={40} />
        <ContentWrapper>
          <NumberPad
            onNumberPress={handlePinChange}
            onDeletePress={onDeletePress}
            variant="neutral"
            deleteAccessibilityLabel={t('global:buttons.delete')}
          />
          <VSpacer />
          <View style={{alignSelf: 'center'}}>
            <IOButton
              variant="link"
              onPress={present}
              label={t('onboarding:pin.policy.title')}
            />
          </View>
          {bottomSheet}
        </ContentWrapper>
      </View>
      {isDevEnv && (
        <>
          <VSpacer />
          <FooterActions
            actions={{
              primary: {
                label: `Enter Pin: ${DEFAULT_PIN} (DevEnv Only)`,
                onPress: insertValidPin
              },
              type: 'SingleButton'
            }}
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    flex: 1,
    justifyContent: 'center'
  },
  pictogram: {
    alignItems: 'center'
  }
});
