import {
  HeaderSecondLevel,
  useIOTheme,
  VSpacer
} from '@pagopa/io-app-design-system';
import { StackScreenProps } from '@react-navigation/stack';
import { memo, useCallback, useLayoutEffect, useState } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ItwSkeumorphicCard,
  SKEUMORPHIC_CARD_ASPECT_RATIO
} from '../../components/credential/ItwSkeumorphicCard';
import { FlipGestureDetector } from '../../components/credential/ItwSkeumorphicCard/FlipGestureDetector';
import { ItwPresentationCredentialCardFlipButton } from '../../components/presentation/ItwPresentationCredentialCardFlipButton';
import { ItwPresentationCredentialCardHideValuesButton } from '../../components/presentation/ItwPresentationCredentialCardHideValuesButton';
import { WalletNavigatorParamsList } from '../../navigation/wallet/WalletNavigator';
import {
  itwIsClaimValueHiddenSelector,
  itwSetClaimValuesHidden
} from '../../store/credentials';
import { ParsedClaimsRecord } from '../../utils/claims';
import { getCredentialCapabilities } from '../../utils/itwCredentialCapabilities';
import {
  ItwCredentialStatus,
  StoredCredential
} from '../../utils/itwTypesUtils';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  useMaxBrightness,
  usePreventScreenCapture
} from '@io-eudiw-app/commons';
import { selectIsDebugModeEnabled } from '@io-eudiw-app/debug-info';
import { useTranslation } from 'react-i18next';

export type ItwPresentationCredentialCardModalNavigationParams = {
  credential: StoredCredential;
  parsedClaims: ParsedClaimsRecord;
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
  const { credential, parsedClaims, status } = route.params;
  const safeAreaInsets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  // cardAreaHeight is measured via onLayout so we can clamp cardPreRotationWidth
  // on small devices: after rotate("90deg"), the visual card height = cardPreRotationWidth,
  // so we cap it to the available area height to prevent overlap with the footer.
  const [cardAreaHeight, setCardAreaHeight] = useState(0);
  const cardPreRotationWidth = Math.min(
    (screenWidth - 48) * SKEUMORPHIC_CARD_ASPECT_RATIO,
    cardAreaHeight
  );
  const [isFlipped, setFlipped] = useState(false);
  const theme = useIOTheme();
  const dispatch = useAppDispatch();
  const valuesHidden = useAppSelector(itwIsClaimValueHiddenSelector);
  const isDebugEnabled = useAppSelector(selectIsDebugModeEnabled);
  const { t } = useTranslation(['common', 'wallet']);
  const capabilities = getCredentialCapabilities(credential.credentialType);

  usePreventScreenCapture(isDebugEnabled);
  useMaxBrightness({ useSmoothTransition: true });

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          title={''}
          type="singleAction"
          firstAction={{
            icon: 'closeLarge',
            accessibilityLabel: t('common:buttons.close'),
            onPress: () => navigation.goBack()
          }}
        />
      )
    });
  }, [navigation, t]);

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
      {/* Card area fills the space between header and footer, centering the card */}
      <View
        style={styles.cardArea}
        onLayout={e => setCardAreaHeight(e.nativeEvent.layout.height)}
      >
        {cardAreaHeight > 0 && (
          // The card is rotated 90°, and react-native-gesture-handler evaluates the
          // Fling direction in a different coordinate space per platform: iOS uses
          // the rotated view's local frame (so a vertical on-screen swipe reads as
          // "leftright"), while Android ignores the transform and stays in screen
          // space (so the same swipe reads as "updown"). Pick the axis per platform
          // so the flip is always triggered by a vertical swipe on both.
          <FlipGestureDetector
            isFlipped={isFlipped}
            setIsFlipped={setFlipped}
            direction={Platform.OS === 'ios' ? 'leftright' : 'updown'}
            disabled={!capabilities.flippable}
          >
            <View
              style={{
                width: cardPreRotationWidth,
                transform: [{ rotate: '90deg' }]
              }}
            >
              <ItwSkeumorphicCard
                credential={credential}
                claims={parsedClaims}
                status={status}
                isFlipped={isFlipped}
                valuesHidden={valuesHidden}
                capabilities={capabilities}
              />
            </View>
          </FlipGestureDetector>
        )}
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
    flex: 1
  },
  cardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

const MemoizedItwPresentationCredentialCardModal = memo(
  ItwPresentationCredentialCardModal
);

export { MemoizedItwPresentationCredentialCardModal as ItwPresentationCredentialCardModal };
