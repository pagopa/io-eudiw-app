import React from 'react';
import {useTranslation} from 'react-i18next';
import {LoadingScreenContent} from '../components/LoadingScreenContent';

const Loading = () => {
  const {t} = useTranslation(['global']);
  return (
    <>
      <LoadingScreenContent contentTitle={t('global:loading.body')} />
    </>
  );
};

export default Loading;
