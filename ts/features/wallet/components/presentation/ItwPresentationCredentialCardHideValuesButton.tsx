import { IOButton } from '@pagopa/io-app-design-system';
import { t } from 'i18next';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

type ItwPresentationCredentialCardHideValuesButtonProps = {
  valuesHidden: boolean;
  handleOnPress: () => void;
};

/**
 * This component renders the hide values button for the skeumorphic credential card in full screen mode
 */
const ItwPresentationCredentialCardHideValuesButton = ({
  valuesHidden,
  handleOnPress
}: ItwPresentationCredentialCardHideValuesButtonProps) => (
  <View
    style={styles.button}
    accessible={true}
    accessibilityLabel={t('presentation.credentialDetails.card.showValues', {
      ns: 'wallet'
    })}
    accessibilityRole="switch"
    accessibilityState={{ checked: !valuesHidden }}
  >
    <IOButton
      variant="link"
      label={t(
        `presentation.credentialDetails.card.${
          valuesHidden ? 'showValues' : 'hideValues'
        }`,
        {
          ns: 'wallet'
        }
      )}
      onPress={handleOnPress}
      icon={valuesHidden ? 'eyeShow' : 'eyeHide'}
      iconPosition="end"
    />
  </View>
);

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center'
  }
});

export const MemoizedItwPresentationCredentialCardHideValuesButton = memo(
  ItwPresentationCredentialCardHideValuesButton
);

export { MemoizedItwPresentationCredentialCardHideValuesButton as ItwPresentationCredentialCardHideValuesButton };
