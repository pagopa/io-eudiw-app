import {IOColors} from '@pagopa/io-app-design-system';
import {memo} from 'react';
import {ImageSourcePropType, StyleSheet, View} from 'react-native';
import {AnimatedImage} from '../../../../../components/AnimatedImage';
import {StoredCredential} from '../../../utils/types';
import {wellKnownCredential} from '../../../utils/credentials';

type CardBackgroundProps = {
  credentialType: StoredCredential['credentialType'];
  side: CardSide;
};

export type CardSide = 'front' | 'back';

/**
 * Renders the background of a card based on its type and side
 */
const CardBackground = ({credentialType, side}: CardBackgroundProps) => {
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
  [wellKnownCredential.DRIVING_LICENSE]: {
    front: require('../../../assets/img/credentials/mdl_front.png'),
    back: require('../../../assets/img/credentials/mdl_back.png')
  },
  [wellKnownCredential.DISABILITY_CARD]: {
    front: require('../../../assets/img/credentials/dc_front.png'),
    back: require('../../../assets/img/credentials/dc_back.png')
  }
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: IOColors['grey-100'],
    borderRadius: 8
  },
  background: {
    width: '100%',
    height: '100%',
    borderRadius: 8
  }
});

const MemoizedCardBackground = memo(CardBackground);

export {MemoizedCardBackground as CardBackground};
