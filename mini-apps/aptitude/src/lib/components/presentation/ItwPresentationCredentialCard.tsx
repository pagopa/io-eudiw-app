import {
  ContentWrapper,
  IOSpacingScale,
  VSpacer,
  VStack
} from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PropsWithChildren, useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useItwDisplayCredentialStatus } from '../../hooks/useItwDisplayCredentialStatus';
import WALLET_ROUTES from '../../navigation/wallet/routes';
import { WalletNavigatorParamsList } from '../../navigation/wallet/WalletNavigator';
import { useAppSelector } from '../../store';
import { itwIsClaimValueHiddenSelector } from '../../store/credentials';
import { ParsedClaimsRecord } from '../../utils/claims';
import { ItwCredentialCapabilities } from '../../utils/itwCredentialCapabilities';
import { getCredentialStatus } from '../../utils/itwCredentialStatusUtils';
import { useThemeColorByCredentialType } from '../../utils/itwStyleUtils';
import { StoredCredentialMetadata } from '../../utils/itwTypesUtils';
import { ItwSkeumorphicCard } from '../credential/ItwSkeumorphicCard';
import { FlipGestureDetector } from '../credential/ItwSkeumorphicCard/FlipGestureDetector';
import { ItwPresentationCredentialCardFlipButton } from './ItwPresentationCredentialCardFlipButton';

type Props = {
  capabilities: ItwCredentialCapabilities;
  credential: StoredCredentialMetadata;
  parsedClaims: ParsedClaimsRecord;
};

/**
 * This component renders the credential card in the presentation screen.
 * If the credential supports the skeumorphic card, it also renders it with the flip button and If L3 is enabled, it shows the badge.
 */
const ItwPresentationCredentialCard = ({
  capabilities,
  credential,
  parsedClaims
}: Props) => {
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
        <FlipGestureDetector
          isFlipped={isFlipped}
          onPress={handleCardPress}
          setIsFlipped={setIsFlipped}
        >
          <ItwSkeumorphicCard
            capabilities={capabilities}
            claims={parsedClaims}
            credential={credential}
            isFlipped={isFlipped}
            status={status}
            valuesHidden={valuesHidden}
          />
        </FlipGestureDetector>
      </CardContainer>
      <VSpacer size={8} />
      <ContentWrapper style={styles.centeredLayout}>
        <ItwPresentationCredentialCardFlipButton
          handleOnPress={handleFlipButtonPress}
          isFlipped={isFlipped}
        />
      </ContentWrapper>
    </VStack>
  );
};

type CardContainerProps = {
  backgroundColor: string;
};

const CardContainer = ({
  backgroundColor,
  children
}: PropsWithChildren<CardContainerProps>) => (
  <View style={styles.cardContainer}>
    {children}
    <View style={[styles.cardBackdrop, { backgroundColor }]} />
  </View>
);

const cardPaddingHorizontal: IOSpacingScale = 16;

const styles = StyleSheet.create({
  cardBackdrop: {
    height: '200%', // Twice the card in order to avoid the white background when the scrollview bounces
    left: 0,
    position: 'absolute',
    right: 0,
    top: '-130%', // Offset by the card height + a 30%
    zIndex: -1
  },
  cardContainer: {
    paddingHorizontal: cardPaddingHorizontal,
    paddingTop: 8, // Add top padding to prevent card clipping during flip animation
    position: 'relative'
  },
  centeredLayout: {
    alignSelf: 'center'
  }
});

export { ItwPresentationCredentialCard };
