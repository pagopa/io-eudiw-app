import {
  LoadingScreenContent,
  useDisableGestureNavigation,
  useHardwareBackButton,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
import { Body } from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { WalletNavigatorParamsList } from '../../navigation/wallet/WalletNavigator';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectCredential } from '../../store/credentials';
import {
  selectCredentialNotFound,
  selectPreDefinitionStatus,
  selectPreDefitionResult,
  setPreDefinitionRequest
} from '../../store/presentation';
import { wellKnownCredential } from '../../utils/credentials';

export type PresentationPreDefinitionParams = {
  client_id: string;
  request_uri: string;
  request_uri_method?: 'get' | 'post' | null;
  state?: null | string;
};

type Props = StackScreenProps<
  WalletNavigatorParamsList,
  'PRESENTATION_PRE_DEFINITION'
>;

/**
 * Presentation for the issuance flow before the user has received the descriptor containing the requested claims.
 * It requires a presentation URL to start the presentation flow. The URL is passed via navigation params.
 * The screen will show a loading message while the presentation is in progress. If the presentation is successful,
 * the user will be redirected to the PresentationPostDefinition screen which shows the requested claims.
 */
const PresentationPreDefinition = ({ route }: Props) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const preDefinitionStatus = useAppSelector(selectPreDefinitionStatus);
  const preDefinitionResult = useAppSelector(selectPreDefitionResult);
  const credentialNotFound = useAppSelector(selectCredentialNotFound);
  const pid = useAppSelector(selectCredential(wellKnownCredential.PID));

  // Disable the back gesture navigation and the hardware back button
  useDisableGestureNavigation();
  useHardwareBackButton(() => true);

  useEffect(() => {
    dispatch(setPreDefinitionRequest(route.params));
  }, [dispatch, route.params]);

  /**
   * Check the status of the presentation request. If the request is successful, navigate to the PresentationPostDefinition screen.
   * Otherwise, navigate to the PresentationFailure screen.
   */
  useEffect(() => {
    if (preDefinitionStatus.success.status && preDefinitionResult) {
      navigation.navigate('MAIN_WALLET_NAV', {
        params: {
          descriptor: preDefinitionResult
        },
        screen: 'PRESENTATION_POST_DEFINITION'
      });
    } else if (preDefinitionStatus.error.status) {
      switch (preDefinitionStatus.error.type) {
        case 'CREDENTIAL_NOT_FOUND':
          if (credentialNotFound) {
            navigation.navigate('MAIN_WALLET_NAV', {
              params: { credentialType: credentialNotFound },
              screen: 'PRESENTATION_CREDENTIAL_NOT_FOUND'
            });
          } else {
            navigation.navigate('MAIN_WALLET_NAV', {
              screen: 'PRESENTATION_FAILURE'
            });
          }
          break;
        case 'WALLET_NOT_ACTIVE':
          navigation.navigate('MAIN_WALLET_NAV', {
            screen: 'PRESENTATION_WALLET_NOT_ACTIVE'
          });
          break;
        default:
          navigation.navigate('MAIN_WALLET_NAV', {
            screen: 'PRESENTATION_FAILURE'
          });
      }
    }
  }, [
    credentialNotFound,
    navigation,
    pid,
    preDefinitionResult,
    preDefinitionStatus
  ]);

  useHeaderSecondLevel({
    headerShown: false,
    title: ''
  });

  return (
    <LoadingScreenContent
      contentTitle={t('presentation.loading.title', { ns: 'wallet' })}
    >
      <Body style={{ textAlign: 'center' }}>
        {t('presentation.loading.subtitle', { ns: 'wallet' })}
      </Body>
    </LoadingScreenContent>
  );
};

export default PresentationPreDefinition;
