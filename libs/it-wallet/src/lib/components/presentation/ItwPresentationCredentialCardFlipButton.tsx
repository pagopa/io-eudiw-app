import { IOButton } from '@pagopa/io-app-design-system';
import { t } from 'i18next';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

type ItwPresentationCredentialCardFlipButtonProps = {
  fullScreen?: boolean;
  handleOnPress: () => void;
  isFlipped: boolean;
};

/**
 * This component renders the flip button for the skeumorphic credential card
 */
const ItwPresentationCredentialCardFlipButton = ({
  fullScreen = false,
  handleOnPress,
  isFlipped
}: ItwPresentationCredentialCardFlipButtonProps) => (
  <View
    accessibilityLabel={t('presentation.credentialDetails.card.showBack', {
      ns: 'wallet'
    })}
    accessibilityRole="switch"
    accessibilityState={{ checked: isFlipped }}
    accessible={true}
    style={fullScreen ? styles.fullWidthButton : styles.button}
  >
    <IOButton
      icon="switchCard"
      iconPosition="end"
      label={t(
        `presentation.credentialDetails.card.${
          isFlipped ? 'showFront' : 'showBack'
        }`,
        {
          ns: 'wallet'
        }
      )}
      onPress={handleOnPress}
      variant={fullScreen ? 'solid' : 'link'}
    />
  </View>
);

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center'
  },
  fullWidthButton: {
    alignSelf: 'stretch',
    marginHorizontal: '5%'
  }
});

const MemoizedItwPresentationCredentialCardFlipButton = memo(
  ItwPresentationCredentialCardFlipButton
);

export { MemoizedItwPresentationCredentialCardFlipButton as ItwPresentationCredentialCardFlipButton };
