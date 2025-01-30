import React, {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useHardwareBackButton} from '../../../../hooks/useHardwareBackButton';
import {useDisableGestureNavigation} from '../../../../hooks/useDisableGestureNavigation';
import LoadingScreenContent from '../../../../components/LoadingScreenContent';
import {useAppDispatch, useAppSelector} from '../../../../store';
import {
  selectPreDefinitionStatus,
  selectPreDefitionResult,
  setPreDefinitionRequest
} from '../../store/presentation';
import {useHeaderSecondLevel} from '../../../../hooks/useHeaderSecondLevel';
import {WalletNavigatorParamsList} from '../../navigation/WalletNavigator';
import {selectCredential} from '../../store/credentials';
import {wellKnownCredential} from '../../utils/credentials';

export type PresentationPreDefinitionParams = {
  presentationUrl: string;
};

type Props = NativeStackScreenProps<
  WalletNavigatorParamsList,
  'PRESENTATION_PRE_DEFINITION'
>;

/**
 * Component to be rendered as fallback when a credential is not found and the user tries to open its details.
 * This should be possible as only credentials present in the store are rendered, however it's still used as a fallback.
 * If the credential doesn't exists, the user can request it by opening the issuance flow.
 */
const PresentationPreDefinition = ({route}: Props) => {
  const navigation = useNavigation();
  const {t} = useTranslation(['global', 'wallet']);
  const dispatch = useAppDispatch();
  const preDefinitionStatus = useAppSelector(selectPreDefinitionStatus);
  const preDefinitionResult = useAppSelector(selectPreDefitionResult);
  const pid = useAppSelector(selectCredential(wellKnownCredential.PID));

  // Disable the back gesture navigation and the hardware back button
  useDisableGestureNavigation();
  useHardwareBackButton(() => true);

  useEffect(() => {
    dispatch(setPreDefinitionRequest({url: route.params.presentationUrl}));
  }, [dispatch, route.params.presentationUrl]);

  useEffect(() => {
    if (preDefinitionStatus.success.status && preDefinitionResult) {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'PRESENTATION_POST_DEFINITION',
        params: {
          descriptor: preDefinitionResult
        }
      });
    } else if (preDefinitionStatus.error.status) {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'PRESENTATION_FAILURE'
      });
    }
  }, [navigation, pid, preDefinitionResult, preDefinitionStatus]);

  useHeaderSecondLevel({
    headerShown: false,
    title: ''
  });

  // // Since this component could be used on a screen where the header is visible, we hide it.
  // useEffect(() => {
  //   navigation.setOptions({
  //     headerShown: false
  //   });
  // }, [navigation]);

  return (
    <LoadingScreenContent
      contentTitle={t('wallet:presentation.loading.title')}
      subTitle={t('wallet:presentation.loading.subtitle')}
    />
  );
};

export default PresentationPreDefinition;
