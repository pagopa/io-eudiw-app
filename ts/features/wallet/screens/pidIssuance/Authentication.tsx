import {
  ContentWrapper,
  FooterActions,
  H1,
  VSpacer
} from '@pagopa/io-app-design-system';
import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {useHeaderSecondLevel} from '../../../../hooks/useHeaderSecondLevel';
import {AnimatedImage} from '../../../../components/AnimatedImage';
import Markdown from '../../../../components/markdown';
import {useAppDispatch, useAppSelector} from '../../../../store';
import {
  resetInstanceCreation,
  selectInstanceStatus,
  selectPidIssuanceStatus,
  setInstanceCreationRequest,
  setPidIssuanceRequest
} from '../../store/pidIssuance';
import {selectAttestation} from '../../store/attestation';
import LoadingScreenContent from '../../../../components/LoadingScreenContent';

/**
 * Screen which shows the information about the wallet and then registers a wallet instance.
 */
const Authentication = () => {
  const {t} = useTranslation(['wallet', 'global']);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const {error, success, loading} = useAppSelector(selectPidIssuanceStatus);
  const [canGoBack, setCanGoBack] = useState(true);

  useEffect(() => {
    dispatch(setPidIssuanceRequest());
    console.log('dispatched');
  }, [dispatch]);

  useEffect(() => {
    if (error.status === true) {
      navigation.navigate('MAIN_WALLET', {
        screen: 'RESULT_ERROR'
      });
    }
  }, [error, navigation]);

  useEffect(() => {
    if (success.status === true) {
      setCanGoBack(false);
    }
  }, [success]);

  useHeaderSecondLevel({
    title: '',
    canGoBack
  });

  return (
    <>
      {loading && (
        <LoadingScreenContent contentTitle={t('global:genericWaiting')} />
      )}
      {success.status === true && (
        <>
          <FooterActions
            actions={{
              primary: {
                label: t('wallet:pidIssuance.success.button'),
                onPress: () => void 0,
                icon: 'add',
                iconPosition: 'end'
              },
              secondary: {
                label: t('global:buttons.cancel'),
                onPress: () => void 0
              },
              type: 'TwoButtons'
            }}
            transparent
          />
        </>
      )}
    </>
  );
};

export default Authentication;
