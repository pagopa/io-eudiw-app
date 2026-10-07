import {
  LoadingScreenContent,
  useDisableGestureNavigation,
  useHardwareBackButton,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
import { useDebugInfo } from '@io-eudiw-app/debug-info';
import {
  Body,
  FooterActions,
  ForceScrollDownView,
  IOVisualCostants
} from '@pagopa/io-app-design-system';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, View } from 'react-native';

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
  const { t } = useTranslation(['common', 'itWalletHsm']);
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
  const cancel = () => {
    dispatch(setProximityStatusAuthorizationRejected());
    dispatch(resetProximity());
    navigateToWallet();
  };

  const cancelAlert = () => {
    Alert.alert(t('common:cancelOperation.title'), '', [
      {
        onPress: cancel,
        style: 'destructive',
        text: t('common:cancelOperation.confirm')
      },
      {
        style: 'cancel',
        text: t('common:cancelOperation.cancel')
      }
    ]);
  };

  useHeaderSecondLevel({
    goBack: cancelAlert,
    title: ''
  });

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

  if (!proximityDetails) {
    return (
      <LoadingScreenContent
        contentTitle={t('presentation.loading.title', { ns: 'itWalletHsm' })}
      >
        <Body style={{ textAlign: 'center' }}>
          {t('presentation.loading.subtitle', { ns: 'itWalletHsm' })}
        </Body>
      </LoadingScreenContent>
    );
  }

  return (
    <ForceScrollDownView style={styles.scroll} threshold={50}>
      <View style={{ flexGrow: 1, margin: IOVisualCostants.appMarginDefault }}>
        <ItwProximityPresentationDetails data={proximityDetails} />
      </View>
      <FooterActions
        actions={{
          primary: {
            label: t('buttons.confirm'),
            loading:
              proximityStatus ===
                ProximityStatus.PROXIMITY_STATUS_AUTHORIZATION_SEND ||
              proximityStatus ===
                ProximityStatus.PROXIMITY_STATUS_AUTHORIZATION_COMPLETE,
            onPress: () => {
              dispatch(setProximityStatusAuthorizationSend());
            }
          },
          secondary: {
            label: t('buttons.cancel'),
            onPress: cancelAlert
          },
          type: 'TwoButtons'
        }}
        fixed={false}
      />
    </ForceScrollDownView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1
  }
});

export default PresentationProximityPreview;
