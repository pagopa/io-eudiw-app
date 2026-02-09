import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { StackScreenProps } from '@react-navigation/stack';
import { Body } from '@pagopa/io-app-design-system';
import { useHardwareBackButton } from '../../../../hooks/useHardwareBackButton';
import { useDisableGestureNavigation } from '../../../../hooks/useDisableGestureNavigation';
import { LoadingScreenContent } from '../../../../components/LoadingScreenContent';
import { useAppDispatch, useAppSelector } from '../../../../store';
import {
  selectPreDefinitionStatus,
  selectPreDefitionResult,
  setPreDefinitionRequest
} from '../../store/presentation';
import { useHeaderSecondLevel } from '../../../../hooks/useHeaderSecondLevel';
import { WalletNavigatorParamsList } from '../../navigation/WalletNavigator';
import { selectCredential } from '../../store/credentials';
import { wellKnownCredential } from '../../utils/credentials';

export type PresentationPreDefinitionParams = {
  client_id: string;
  request_uri: string;
  state?: string | null;
  request_uri_method?: 'get' | 'post' | null;
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
  const { t } = useTranslation(['global', 'wallet']);
  const dispatch = useAppDispatch();
  const preDefinitionStatus = useAppSelector(selectPreDefinitionStatus);
  const preDefinitionResult = useAppSelector(selectPreDefitionResult);
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

  return (
    <LoadingScreenContent contentTitle={t('wallet:presentation.loading.title')}>
      <Body style={{ textAlign: 'center' }}>
        {t('wallet:presentation.loading.subtitle')}
      </Body>
    </LoadingScreenContent>
  );
};

export default PresentationPreDefinition;
