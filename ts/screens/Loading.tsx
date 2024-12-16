import React from 'react';
import {useTranslation} from 'react-i18next';
import {OperationResultScreenContent} from '../components/screens/OperationResultScreenContent';

const Loading = () => {
  const {t} = useTranslation(['global']);
  return (
    <>
      <OperationResultScreenContent
        pictogram="loading"
        title={t('global:loading.body')}
      />
    </>
  );
};

export default Loading;
