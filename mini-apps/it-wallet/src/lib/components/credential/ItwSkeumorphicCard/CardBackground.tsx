import { AnimatedImage } from '@io-eudiw-app/commons';
import { IOColors } from '@pagopa/io-app-design-system';
import { memo } from 'react';
import { ImageSourcePropType, StyleSheet, View } from 'react-native';

import { wellKnownCredential } from '../../../utils/credentials';
import { StoredCredentialMetadata } from '../../../utils/itwTypesUtils';
import { CardSide } from './types';

type CardBackgroundProps = {
  credentialType: StoredCredentialMetadata['credentialType'];
  side: CardSide;
};

/**
 * Renders the background of a card based on its type and side
 */
const CardBackground = ({ credentialType, side }: CardBackgroundProps) => {
  const cardAssets = assetsMap[credentialType];

  if (cardAssets === undefined) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <AnimatedImage source={cardAssets[side]} style={styles.background} />
    </View>
  );
};

type CardAssets = Record<CardSide, ImageSourcePropType>;

/**
 * Map that defines which assets to use for each credential type
 */
const assetsMap: Record<string, CardAssets> = {
  [wellKnownCredential.DISABILITY_CARD]: {
    back: require('../../../../assets/img/credential/dc_back.png'),
    front: require('../../../../assets/img/credential/dc_front.png')
  },
  [wellKnownCredential.DRIVING_LICENSE]: {
    back: require('../../../../assets/img/credential/mdl_back.png'),
    front: require('../../../../assets/img/credential/mdl_front.png')
  }
};

const styles = StyleSheet.create({
  background: {
    borderRadius: 8,
    height: '100%',
    width: '100%'
  },
  wrapper: {
    backgroundColor: IOColors['grey-100'],
    borderRadius: 8
  }
});

const MemoizedCardBackground = memo(CardBackground);

export { MemoizedCardBackground as CardBackground };
