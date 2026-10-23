import {
  LoadingScreenContent,
  useDisableGestureNavigation,
  useHardwareBackButton
} from '@io-eudiw-app/commons';
import {
  selectIsDebugModeEnabled,
  useDebugInfo
} from '@io-eudiw-app/debug-info';
import {
  Alert as AlertDs,
  Body,
  ContentWrapper,
  ForceScrollDownView,
  H2,
  HeaderSecondLevel,
  IOMarkdownLite,
  VStack
} from '@pagopa/io-app-design-system';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCallback, useEffect, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { ItwDataExchangeIcons } from '../../components/ItwDataExchangeIcons';
import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';
import { MainNavigatorParamsList } from '../../navigation/main/MainStackNavigator';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  ProximityStatus,
  resetProximity,
  selectProximityDisclosureDescriptor,
  selectProximityDisclosureIsAuthenticated,
  selectProximityDocumentRequest,
  selectProximityErrorDetails,
  selectProximityStatus,
  setProximityStatusAuthorizationRejected,
  setProximityStatusAuthorizationSend,
  setProximityStatusPresentationDetails
} from '../../store/proximity';
import { ItwProximityPresentationDetails } from './ItwProximityPresentationDetails';

type LoadingContentProps = {
  variant: 'connection' | 'send';
};

/**
 * Loading content shown while waiting for the verifier request (`connection`)
 * and while the identification is performed and the documents are sent
 * (`send`).
 */
const LoadingContent = ({ variant }: LoadingContentProps) => {
  const { t } = useTranslation('wallet');

  return (
    <LoadingScreenContent
      contentTitle={t(`proximity.${variant}Loading.title`)}
      headerVisible
    >
      <Body style={{ textAlign: 'center' }}>
        {t(`proximity.${variant}Loading.subtitle`)}
      </Body>
    </LoadingScreenContent>
  );
};

/**
 * Screen that shows the claims required for a Proximity presentation
 * and handles presentation completion or cancellation
 */
const PresentationProximityPreview = () => {
  const proximityDetails = useAppSelector(selectProximityDisclosureDescriptor);
  const dispatch = useAppDispatch();
  const navigation =
    useNavigation<StackNavigationProp<MainNavigatorParamsList>>();
  const { navigateToWallet } = useNavigateToWalletWithReset();
  const proximityStatus = useAppSelector(selectProximityStatus);
  const { t } = useTranslation(['common', 'wallet']);
  const isDebug = useAppSelector(selectIsDebugModeEnabled);
  const isAuthenticated = useAppSelector(
    selectProximityDisclosureIsAuthenticated
  );

  const proximityErrorDetails = useAppSelector(selectProximityErrorDetails);
  const verifierRequest = useAppSelector(selectProximityDocumentRequest);

  useDebugInfo({
    isAuthenticated,
    proximityDetails,
    proximityErrorDetailsPreview: proximityErrorDetails ?? 'No errors',
    proximityStatusPreview: proximityStatus,
    verifierRequest
  });

  useFocusEffect(
    useCallback(() => {
      // Handle navigation based on the proximity presentation result
      if (proximityStatus === ProximityStatus.PROXIMITY_STATUS_STOPPED) {
        navigation.navigate('MAIN_WALLET_NAV', {
          screen: 'PROXIMITY_SUCCESS'
        });
      } else if (
        proximityStatus === ProximityStatus.PROXIMITY_STATUS_STORE_CONSENT
      ) {
        // NFC-retrieval dance: after confirming the claims the middleware asks
        // whether to persist the consent before re-engaging.
        navigation.navigate('MAIN_WALLET_NAV', {
          screen: 'PROXIMITY_STORE_CONSENT'
        });
      } else if (
        proximityStatus === ProximityStatus.PROXIMITY_STATUS_ABORTED ||
        proximityStatus === ProximityStatus.PROXIMITY_STATUS_ERROR
      ) {
        navigation.navigate('MAIN_WALLET_NAV', {
          params: {
            fatal: true
          },
          screen: 'PROXIMITY_FAILURE'
        });
      } else if (
        proximityStatus === ProximityStatus.PROXIMITY_STATUS_ERROR_AUTHORIZED
      ) {
        navigation.navigate('MAIN_WALLET_NAV', {
          params: { fatal: false },
          screen: 'PROXIMITY_FAILURE'
        });
      }
    }, [proximityStatus, navigation])
  );

  // Disable the back gesture navigation and the hardware back button
  useDisableGestureNavigation();
  useHardwareBackButton(() => true);

  // In case of cancellation, stop the proximity flow and go to the Wallet Home
  const cancel = useCallback(() => {
    dispatch(setProximityStatusAuthorizationRejected());
    dispatch(resetProximity());
    navigateToWallet();
  }, [dispatch, navigateToWallet]);

  const cancelAlert = useCallback(() => {
    Alert.alert(
      t('common:cancelOperation.title'),
      t('wallet:proximity.selectiveDisclosure.alert.message'),
      [
        {
          onPress: cancel,
          style: 'destructive',
          text: t('common:cancelOperation.confirm')
        },
        {
          style: 'cancel',
          text: t('common:cancelOperation.cancel')
        }
      ]
    );
  }, [cancel, t]);

  const isAuthenticatedAlert = isAuthenticated ? (
    <AlertDs
      content={t('wallet:proximity.isAuthenticated.true')}
      variant="success"
    />
  ) : (
    <AlertDs
      content={t('wallet:proximity.isAuthenticated.false')}
      variant="warning"
    />
  );

  // State when the user is checking which claims to disclose and has to confirm
  const isReviewingClaims =
    proximityStatus ===
      ProximityStatus.PROXIMITY_STATUS_AUTHORIZATION_STARTED ||
    proximityStatus === ProximityStatus.PROXIMITY_STATUS_PRESENTATION_DETAILS;

  // State where the app is sending data to the verifier
  const isSending = !!proximityDetails && !isReviewingClaims;

  //State where the app is loading either the proximity details or sending data
  const isLoading = !proximityDetails || isSending;

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () =>
        isLoading ? (
          <HeaderSecondLevel title={''} type="base" />
        ) : (
          <HeaderSecondLevel
            firstAction={{
              accessibilityLabel: t('common:buttons.close'),
              icon: 'closeLarge',
              onPress: cancelAlert
            }}
            title={''}
            type="singleAction"
          />
        ),
      headerShown: true
    });
  }, [navigation, t, cancelAlert, isLoading]);

  /**
   * Listener for navigation transition end to detect that navigation
   * to the screen has finished and so the proximity flow can go on.
   */
  useEffect(() => {
    const unsubscribe = navigation.addListener('transitionEnd', () => {
      dispatch(setProximityStatusPresentationDetails());
    });
    return unsubscribe;
  }, [navigation, dispatch]);

  const verifierName =
    proximityDetails?.[0]?.rpId ??
    t('wallet:proximity.selectiveDisclosure.unknownVerifier');

  if (isSending) {
    return <LoadingContent variant="send" />;
  }

  if (!proximityDetails) {
    return <LoadingContent variant="connection" />;
  }

  return (
    <ForceScrollDownView
      footerActions={{
        actions: {
          primary: {
            label: t('buttons.confirm'),
            onPress: () => {
              dispatch(setProximityStatusAuthorizationSend());
            }
          },
          secondary: {
            label: t('common:buttons.undo'),
            onPress: cancelAlert
          },
          type: 'TwoButtons'
        }
      }}
    >
      <ContentWrapper>
        <VStack space={24}>
          <ItwDataExchangeIcons />
          <VStack space={16}>
            <H2>{t('wallet:proximity.selectiveDisclosure.title')}</H2>
            <IOMarkdownLite
              content={t('wallet:proximity.selectiveDisclosure.subtitle', {
                relyingParty: verifierName
              })}
            />
          </VStack>
          {isDebug && isAuthenticatedAlert}
          <ItwProximityPresentationDetails data={proximityDetails} />
          <Body>{t('wallet:credentialIssuance.trust.disclaimer')}</Body>
        </VStack>
      </ContentWrapper>
    </ForceScrollDownView>
  );
};

export default PresentationProximityPreview;
