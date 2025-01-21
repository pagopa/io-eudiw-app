import {HStack, IOColors, IOText} from '@pagopa/io-app-design-system';
import {ImageSourcePropType, StyleSheet, View} from 'react-native';
import React from 'react';
import {getThemeColorByCredentialType} from '../utils/style';
import {
  getCredentialNameByType,
  wellKnownCredential
} from '../utils/credentials';
import {AnimatedImage} from '../../../components/AnimatedImage';

export type CredentialCard = {
  credentialType: string;
};

type StyleProps = {
  cardBackgroundSource: ImageSourcePropType;
  titleColor: string;
  titleOpacity: number;
};

const getStyleProps = (credentialType: string): StyleProps => {
  const theme = getThemeColorByCredentialType(credentialType);
  const cardBackgroundSource = credentialCardBackgrounds[credentialType];

  return {
    cardBackgroundSource,
    titleColor: theme.textColor,
    titleOpacity: 1
  };
};

/**
 * Renders a credential card based on the credential type.
 * Each credential type is mapped to a specific background image.
 */
export const CredentialCard = ({credentialType}: CredentialCard) => {
  const styleProps = getStyleProps(credentialType);

  return (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <AnimatedImage
          source={styleProps.cardBackgroundSource}
          style={styles.cardBackground}
        />
      </View>
      <View style={styles.header}>
        <HStack space={16}>
          <IOText
            size={16}
            lineHeight={20}
            font="TitilliumSansPro"
            weight="Semibold"
            maxFontSizeMultiplier={1.25}
            style={{
              letterSpacing: 0.25,
              color: styleProps.titleColor,
              opacity: styleProps.titleOpacity,
              flex: 1,
              flexShrink: 1
            }}>
            {getCredentialNameByType(credentialType).toUpperCase()}
          </IOText>
        </HStack>
      </View>
    </View>
  );
};

const credentialCardBackgrounds: {
  [type: string]: ImageSourcePropType;
} = {
  [wellKnownCredential.PID]: require('../../../../assets/credentials/pid.png')
};

const styles = StyleSheet.create({
  cardContainer: {
    aspectRatio: 16 / 10,
    borderRadius: 8,
    overflow: 'hidden'
  },
  card: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: IOColors['grey-100']
  },
  cardBackground: {height: '100%', width: '100%'},
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14
  }
});
