import {
  ContentWrapper,
  IOSpacingScale,
  VSpacer,
  VStack
} from '@pagopa/io-app-design-system';

import { PropsWithChildren, useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getCredentialStatus } from '../../utils/itwCredentialStatusUtils';
import { useItwDisplayCredentialStatus } from '../../hooks/useItwDisplayCredentialStatus';
import { useThemeColorByCredentialType } from '../../utils/itwStyleUtils';
import { FlipGestureDetector } from '../credential/ItwSkeumorphicCard/FlipGestureDetector';
import { ItwSkeumorphicCard } from '../credential/ItwSkeumorphicCard';
import { WalletNavigatorParamsList } from '../../navigation/WalletNavigator';
import WALLET_ROUTES from '../../navigation/routes';
import { useAppSelector } from '../../../../store';
import { itwIsClaimValueHiddenSelector } from '../../store/credentials';
import { StoredCredential } from '../../utils/itwTypesUtils';
import { ParsedClaimsRecord } from '../../utils/claims';
import { ItwPresentationCredentialCardFlipButton } from './ItwPresentationCredentialCardFlipButton';

type Props = {
  credential: StoredCredential;
  parsedClaims: ParsedClaimsRecord;
};

/**
 * This component renders the credential card in the presentation screen.
 * If the credential supports the skeumorphic card, it also renders it with the flip button and If L3 is enabled, it shows the badge.
 */
const ItwPresentationCredentialCard = ({ credential, parsedClaims }: Props) => {
  const navigation =
    useNavigation<StackNavigationProp<WalletNavigatorParamsList>>();
  const [isFlipped, setIsFlipped] = useState(false);
  const credentialStatus = getCredentialStatus(credential);
  const status = useItwDisplayCredentialStatus(credentialStatus);

  const handleFlipButtonPress = useCallback(() => {
    setIsFlipped(_ => !_);
  }, []);

  const valuesHidden = useAppSelector(itwIsClaimValueHiddenSelector);

  const handleCardPress = () => {
    navigation.navigate(WALLET_ROUTES.PRESENTATION.CREDENTIAL_CARD_MODAL, {
      credential,
      parsedClaims,
      status
    });
  };

  const { backgroundColor } = useThemeColorByCredentialType(
    credential.credentialType,
    true
  );

  return (
    <VStack space={8}>
      <CardContainer backgroundColor={backgroundColor}>
        <FlipGestureDetector isFlipped={isFlipped} setIsFlipped={setIsFlipped}>
          <ItwSkeumorphicCard
            credential={credential}
            claims={parsedClaims}
            isFlipped={isFlipped}
            status={status}
            valuesHidden={valuesHidden}
            onPress={handleCardPress}
          />
        </FlipGestureDetector>
      </CardContainer>
      <VSpacer size={8} />
      <ContentWrapper style={styles.centeredLayout}>
        <ItwPresentationCredentialCardFlipButton
          isFlipped={isFlipped}
          handleOnPress={handleFlipButtonPress}
        />
      </ContentWrapper>
    </VStack>
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
  },
  centeredLayout: {
    alignSelf: 'center'
  }
});

export { ItwPresentationCredentialCard };
