import {IOSpacingScale} from '@pagopa/io-app-design-system';

import React, {PropsWithChildren} from 'react';
import {StyleSheet, View} from 'react-native';
import {StoredCredential} from '../../utils/types';
import {getThemeColorByCredentialType} from '../../utils/style';
import {CredentialCard} from '../credential/CredentialCard';

type Props = {
  credential: StoredCredential;
};

/**
 * This component renders the credential card in the presentation screen.
 * If the credential supports the skeumorphic card, it also renders it with the flip button.
 */
const PresentationCredentialCard = ({credential}: Props) => {
  const {backgroundColor} = getThemeColorByCredentialType(
    credential.credentialType
  );

  return (
    <CardContainer backgroundColor={backgroundColor}>
      <CredentialCard credentialType={credential.credentialType} />
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
    <View style={[styles.cardBackdrop, {backgroundColor}]} />
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

export {PresentationCredentialCard};
