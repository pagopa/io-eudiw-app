import {
  FeatureInfo,
  FooterActions,
  ForceScrollDownView,
  H2,
  IOVisualCostants,
  VSpacer,
  VStack,
  Alert as AlertDs,
  Body
} from '@pagopa/io-app-design-system';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, Alert } from 'react-native';
import {
  IOMarkdown,
  LoadingScreenContent,
  useDisableGestureNavigation,
  useHardwareBackButton,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
import { ItwDataExchangeIcons } from '../../components/ItwDataExchangeIcons';
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
import { useAppDispatch, useAppSelector } from '../../store';
import {
  selectIsDebugModeEnabled,
  useDebugInfo
} from '@io-eudiw-app/debug-info';
import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainNavigatorParamsList } from '../../navigation/main/MainStackNavigator';

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
    verifierRequest,
    proximityStatusPreview: proximityStatus,
    proximityErrorDetailsPreview: proximityErrorDetails ?? 'No errors'
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
          screen: 'PROXIMITY_FAILURE',
          params: {
            fatal: true
          }
        });
      } else if (
        proximityStatus === ProximityStatus.PRXOMIMITY_STATUS_ERROR_AUTHORIZED
      ) {
        navigation.navigate('MAIN_WALLET_NAV', {
          screen: 'PROXIMITY_FAILURE',
          params: { fatal: false }
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
        text: t('common:cancelOperation.confirm'),
        onPress: cancel,
        style: 'destructive'
      },
      {
        text: t('common:cancelOperation.cancel'),
        style: 'cancel'
      }
    ]);
  };

  const IsAuthenticatedAlert = () => (
    <>
      {isAuthenticated ? (
        <AlertDs
          variant="success"
          content={t('wallet:proximity.isAuthenticated.true')}
        />
      ) : (
        <AlertDs
          variant="warning"
          content={t('wallet:proximity.isAuthenticated.false')}
        />
      )}
      <VSpacer size={24} />
    </>
  );

  useHeaderSecondLevel({
    title: '',
    goBack: cancelAlert
  });

  /**
   * Listener for navigation transition end to detect if the user has navigated
   * to the barcode screen and we can request the camera permission.
   */
  useEffect(() => {
    const unsubscribe = navigation.addListener('transitionEnd', () => {
      dispatch(setProximityStatusPresentationDetails());
    });
    return unsubscribe;
  }, [navigation]);

  if (!proximityDetails) {
    return (
      <LoadingScreenContent
        contentTitle={t('presentation.loading.title', { ns: 'wallet' })}
      >
        <Body style={{ textAlign: 'center' }}>
          {t('presentation.loading.subtitle', { ns: 'wallet' })}
        </Body>
      </LoadingScreenContent>
    );
  }

  return (
    <ForceScrollDownView style={styles.scroll} threshold={50}>
      <View style={{ margin: IOVisualCostants.appMarginDefault, flexGrow: 1 }}>
        <ItwDataExchangeIcons />
        <VSpacer size={24} />
        <VStack space={24}>
          <H2>{t('wallet:presentation.trust.title')}</H2>
          <IOMarkdown
            content={t('wallet:proximity.trust.subtitle', {
              relyingParty: proximityDetails[0]?.rpId ?? ''
            })}
          />
        </VStack>
        <VSpacer size={24} />
        {isDebug && <IsAuthenticatedAlert />}
        <ItwProximityPresentationDetails data={proximityDetails} />
        <VSpacer size={48} />
        <FeatureInfo
          iconName="fornitori"
          body={t('wallet:presentation.trust.disclaimer.0')}
        />
        <VSpacer size={24} />
        <FeatureInfo
          iconName="trashcan"
          body={t('wallet:presentation.trust.disclaimer.1')}
        />
      </View>
      <FooterActions
        fixed={false}
        actions={{
          type: 'TwoButtons',
          primary: {
            label: t('buttons.confirm'),
            onPress: () => {
              dispatch(setProximityStatusAuthorizationSend());
            },
            loading:
              proximityStatus ===
                ProximityStatus.PROXIMITY_STATUS_AUTHORIZATION_SEND ||
              proximityStatus ===
                ProximityStatus.PROXIMITY_STATUS_AUTHORIZATION_COMPLETE
          },
          secondary: {
            label: t('buttons.cancel'),
            onPress: cancelAlert
          }
        }}
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
