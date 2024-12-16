import React from 'react';
import {useTranslation} from 'react-i18next';
import {OperationResultScreenContent} from '../components/screens/OperationResultScreenContent';

const GenericError = () => {
  const {t} = useTranslation(['global']);
  return (
    <OperationResultScreenContent
      pictogram="umbrellaNew"
      title={t('errors.generic.title')}
      subtitle={t('errors.generic.body')}
    />
  );
};

export default GenericError;
