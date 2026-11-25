import { IOText } from '@pagopa/io-app-design-system';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import FlagEU from '../../../../assets/img/flags/eu.svg';
import FlagIT from '../../../../assets/img/flags/it.svg';

const FLAG_WIDTH = 24;
const FLAG_HEIGHT = 16;

/**
 * Badge anchored to the right edge of the PID card which shows where the credential is valid.
 */
export const ValidInBadge = () => {
  const { t } = useTranslation('hsm');
  const label = t('presentation.credentialDetails.validIn');

  return (
    <View accessibilityLabel={`${label} IT EU`} accessible style={styles.badge}>
      <IOText
        color="grey-850"
        font="TitilliumSansPro"
        lineHeight={16}
        maxFontSizeMultiplier={1.25}
        size={12}
        style={styles.label}
        weight="Regular"
      >
        {label}
      </IOText>
      <FlagIT height={FLAG_HEIGHT} width={FLAG_WIDTH} />
      <FlagEU height={FLAG_HEIGHT} width={FLAG_WIDTH} />
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    backgroundColor: '#F3FAFF',
    borderBottomLeftRadius: 16,
    borderColor: 'rgba(0, 102, 204, 0.5)',
    borderRightWidth: 0,
    borderTopLeftRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 6,
    height: 32,
    paddingHorizontal: 12,
    position: 'absolute',
    right: 0,
    top: 11
  },
  label: {
    marginRight: 2
  }
});
