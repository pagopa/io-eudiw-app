import { IOButton } from '@pagopa/io-app-design-system';
import { t } from 'i18next';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

type ItwPresentationCredentialCardHideValuesButtonProps = {
  handleOnPress: () => void;
  valuesHidden: boolean;
};

/**
 * This component renders the hide values button for the skeumorphic credential card in full screen mode
 */
const ItwPresentationCredentialCardHideValuesButton = ({
  handleOnPress,
  valuesHidden
}: ItwPresentationCredentialCardHideValuesButtonProps) => (
  <View
    accessibilityLabel={t('presentation.credentialDetails.card.showValues', {
      ns: 'wallet'
    })}
    accessibilityRole="switch"
    accessibilityState={{ checked: !valuesHidden }}
    accessible={true}
    style={styles.button}
  >
    <IOButton
      icon={valuesHidden ? 'eyeShow' : 'eyeHide'}
      iconPosition="end"
      label={t(
        `presentation.credentialDetails.card.${
          valuesHidden ? 'showValues' : 'hideValues'
        }`,
        {
          ns: 'wallet'
        }
      )}
      onPress={handleOnPress}
      variant="link"
    />
  </View>
);

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center'
  }
});

const MemoizedItwPresentationCredentialCardHideValuesButton = memo(
  ItwPresentationCredentialCardHideValuesButton
);

export { MemoizedItwPresentationCredentialCardHideValuesButton as ItwPresentationCredentialCardHideValuesButton };
