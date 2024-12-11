import React from 'react';
import {
  Body,
  ButtonSolid,
  H1,
  IOStyles,
  LoadingSpinner
} from '@pagopa/io-app-design-system';
import {useTranslation} from 'react-i18next';
import {View, Image} from 'react-native';
import {useHeaderSecondLevel} from '../hooks/useHeaderSecondLevel';

const Loading = () => {
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
          ...IOStyles.centerJustified,
          gap: 32
        }}>
        <LoadingSpinner />
        <Body>{t('global:loading.body')}</Body>
      </View>
    </>
  );
};

export default Loading;
