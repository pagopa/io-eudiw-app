import {
  HeaderSecondLevel,
  IOVisualCostants,
  useIOTheme,
  VSpacer
} from '@pagopa/io-app-design-system';
import { useState, useLayoutEffect, memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import I18n from 'i18next';
import { StackScreenProps } from '@react-navigation/stack';
import { StoredCredential } from '../../utils/types';
import { ItwCredentialStatus } from '../../utils/itwTypesUtils';
import { WalletNavigatorParamsList } from '../../navigation/WalletNavigator';
import { usePreventScreenCapture } from '../../../../hooks/usePreventScreenCapture';
import { useMaxBrightness } from '../../../../utils/brightness';
import {
  ItwSkeumorphicCard,
  SKEUMORPHIC_CARD_ASPECT_RATIO
} from '../../components/credential/ItwSkeumorphicCard';
import { ItwPresentationCredentialCardFlipButton } from '../../components/presentation/ItwPresentationCredentialCardFlipButton';
import { ItwPresentationCredentialCardHideValuesButton } from '../../components/presentation/ItwPresentationCredentialCardHideValuesButton';
import { FlipGestureDetector } from '../../components/credential/ItwSkeumorphicCard/FlipGestureDetector';
import { useAppDispatch, useAppSelector } from '../../../../store';
import {
  itwIsClaimValueHiddenSelector,
  itwSetClaimValuesHidden
} from '../../store/credentials';

export type ItwPresentationCredentialCardModalNavigationParams = {
  credential: StoredCredential;
  status: ItwCredentialStatus;
};

type Props = StackScreenProps<
  WalletNavigatorParamsList,
  'PRESENTATION_CREDENTIAL_CARD_MODAL'
>;

/**
 * Dispalys a full screen modal with the credential card.
 */
const ItwPresentationCredentialCardModal = ({ route, navigation }: Props) => {
  const { credential, status } = route.params;
  const safeAreaInsets = useSafeAreaInsets();
  const [isFlipped, setFlipped] = useState(false);
  const theme = useIOTheme();
  const dispatch = useAppDispatch();
  const valuesHidden = useAppSelector(itwIsClaimValueHiddenSelector);

  usePreventScreenCapture();
  useMaxBrightness({ useSmoothTransition: true });

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          title={''}
          type="singleAction"
          firstAction={{
            icon: 'closeLarge',
            accessibilityLabel: I18n.t('buttons.close', { ns: 'global' }),
            onPress: () => navigation.goBack()
          }}
        />
      )
    });
  }, [navigation]);

  const handleClaimVisibility = useCallback(() => {
    dispatch(itwSetClaimValuesHidden(!valuesHidden));
  }, [valuesHidden, dispatch]);

  return (
    <View
      style={[
        styles.contentContainer,
        {
          paddingBottom: safeAreaInsets.bottom,
          backgroundColor: theme['appBackground-primary']
        }
      ]}
    >
      <View
        style={[
          styles.cardContainer,
          {
            top: -safeAreaInsets.top
          }
        ]}
      >
        <FlipGestureDetector
          isFlipped={isFlipped}
          setIsFlipped={setFlipped}
          direction={'updown'}
        >
          <ItwSkeumorphicCard
            credential={credential}
            status={status}
            isFlipped={isFlipped}
            valuesHidden={valuesHidden}
          />
        </FlipGestureDetector>
      </View>
      <ItwPresentationCredentialCardFlipButton
        isFlipped={isFlipped}
        handleOnPress={() => setFlipped(_ => !_)}
        fullScreen={true}
      />
      <VSpacer size={12} />
      <ItwPresentationCredentialCardHideValuesButton
        handleOnPress={handleClaimVisibility}
        valuesHidden={valuesHidden}
      />
      <VSpacer size={16} />
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  cardContainer: {
    transform: [
      { rotate: '90deg' }, // Rotates the card to landscape
      { scale: SKEUMORPHIC_CARD_ASPECT_RATIO } // Scales the card to fit the screen
    ],
    position: 'absolute',
    paddingHorizontal: 24,
    justifyContent: 'center',
    bottom: IOVisualCostants.headerHeight,
    left: 0,
    right: 0
  }
});

const MemoizedItwPresentationCredentialCardModal = memo(
  ItwPresentationCredentialCardModal
);

export { MemoizedItwPresentationCredentialCardModal as ItwPresentationCredentialCardModal };
