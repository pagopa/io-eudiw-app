import { IOSpacingScale } from '@pagopa/io-app-design-system';
import { PropsWithChildren, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { getThemeColorByCredentialType } from '../../utils/style';
import { FlipGestureDetector } from '../credential/ItwSkeumorphicCard/FlipGestureDetector';
import { ItwSkeumorphicCard } from '../credential/ItwSkeumorphicCard/index';
import { wellKnownCredential } from '../../utils/credentials';
import { CredentialCard } from '../credential/CredentialCard';
import { StoredCredential } from '../../utils/itwTypesUtils';

type Props = {
  credential: StoredCredential;
};

/**
 * This component renders the credential card in the presentation screen.
 * If the credential supports the skeumorphic card, it also renders it with the flip button.
 */
const PresentationCredentialCard = ({ credential }: Props) => {
  const { backgroundColor } = getThemeColorByCredentialType(
    credential.credentialType
  );
  const [isFlipped, setIsFlipped] = useState(false);

  const disabilityCard =
    credential.credentialType === wellKnownCredential.DISABILITY_CARD;

  return (
    <CardContainer backgroundColor={backgroundColor}>
      {!disabilityCard ? (
        <CredentialCard credentialType={credential.credentialType} />
      ) : (
        <FlipGestureDetector isFlipped={isFlipped} setIsFlipped={setIsFlipped}>
          <ItwSkeumorphicCard
            credential={credential}
            isFlipped={isFlipped}
            status={'valid'}
            valuesHidden={false}
            onPress={() => setIsFlipped(!isFlipped)}
          />
        </FlipGestureDetector>
      )}
    </CardContainer>
  );
};

type CardContainerProps = {
  backgroundColor: string;
};

const CardContainer = ({
  children,
  backgroundColor
}: PropsWithChildren<CardContainerProps>) => (
  <View style={styles.cardContainer}>
    {children}
    <View style={[styles.cardBackdrop, { backgroundColor }]} />
  </View>
);

const cardPaddingHorizontal: IOSpacingScale = 16;

const styles = StyleSheet.create({
  cardContainer: {
    position: 'relative',
    paddingHorizontal: cardPaddingHorizontal,
    paddingTop: 8 // Add top padding to prevent card clipping during flip animation
  },
  cardBackdrop: {
    height: '200%', // Twice the card in order to avoid the white background when the scrollview bounces
    position: 'absolute',
    top: '-130%', // Offset by the card height + a 30%
    right: 0,
    left: 0,
    zIndex: -1
  }
});

export { PresentationCredentialCard };
