import React from 'react';
import {Body, ButtonSolid, H1, IOStyles} from '@pagopa/io-app-design-system';
import {useTranslation} from 'react-i18next';
import {View, Image} from 'react-native';
import {useHeaderSecondLevel} from '../hooks/useHeaderSecondLevel';

const GenericError = () => {
  const {t} = useTranslation(['global']);
  useHeaderSecondLevel({
    goBack: () => {},
    title: ''
  });
  return (
    <>
      <View
        style={{
          ...IOStyles.flex,
          ...IOStyles.horizontalContentPadding,
          ...IOStyles.alignCenter,
          gap: 32,
          paddingTop: '25%'
        }}>
        <Image source={require('../../assets/errors/genericError.png')} />
        <H1>{t('global:errors.generic.title')}</H1>
        <Body>{t('global:errors.generic.body')}</Body>
        <ButtonSolid
          label={t('global:buttons.continue')}
          fullWidth
          onPress={() => {}}
        />
      </View>
    </>
  );
};

export default GenericError;
