import {
  FeatureInfo,
  FooterActions,
  ForceScrollDownView,
  H2,
  IOVisualCostants,
  VSpacer,
  VStack,
  Alert as AlertDs
} from '@pagopa/io-app-design-system';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, Alert } from 'react-native';

import IOMarkdown from '../../../../components/IOMarkdown';
import { useDebugInfo } from '../../../../hooks/useDebugInfo';
import { useDisableGestureNavigation } from '../../../../hooks/useDisableGestureNavigation';
import { useHardwareBackButton } from '../../../../hooks/useHardwareBackButton';
import { useHeaderSecondLevel } from '../../../../hooks/useHeaderSecondLevel';
import { useNavigateToWalletWithReset } from '../../../../hooks/useNavigateToWalletWithReset';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { selectIsDebugModeEnabled } from '../../../../store/reducers/debug';
import { ItwDataExchangeIcons } from '../../components/ItwDataExchangeIcons';
import { WalletNavigatorParamsList } from '../../navigation/WalletNavigator';
import {
  ProximityDisclosure,
  ProximityStatus,
  resetProximity,
  selectProximityDocumentRequest,
  selectProximityErrorDetails,
  selectProximityStatus,
  setProximityStatusAuthorizationRejected,
  setProximityStatusAuthorizationSend
} from '../../store/proximity';
import { ISSUER_MOCK_NAME } from '../../utils/itwMocksUtils';
import { ItwProximityPresentationDetails } from './ItwProximityPresentationDetails';

export type PresentationProximityPreviewProps = ProximityDisclosure;

type Props = StackScreenProps<WalletNavigatorParamsList, 'PROXIMITY_PREVIEW'>;

/**
 * Screen that shows the claims required for a Proximity presentation
 * and handles presentation completion or cancellation
 */
const PresentationProximityPreview = ({ route }: Props) => {
  const proximityDetails = route.params.descriptor;
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { navigateToWallet } = useNavigateToWalletWithReset();
  const proximityStatus = useAppSelector(selectProximityStatus);
  const { t } = useTranslation(['global', 'wallet']);
  const isDebug = useAppSelector(selectIsDebugModeEnabled);
  const isAuthenticated = route.params.isAuthenticated;

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
    Alert.alert(t('global:cancelOperation.title'), '', [
      {
        text: t('global:cancelOperation.confirm'),
        onPress: cancel,
        style: 'destructive'
      },
      {
        text: t('global:cancelOperation.cancel'),
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

  return (
    <ForceScrollDownView style={styles.scroll} threshold={50}>
      <View style={{ margin: IOVisualCostants.appMarginDefault, flexGrow: 1 }}>
        <ItwDataExchangeIcons />
        <VSpacer size={24} />
        <VStack space={24}>
          <H2>{t('wallet:presentation.trust.title')}</H2>
          <IOMarkdown
            content={t('wallet:proximity.trust.subtitle', {
              relyingParty: ISSUER_MOCK_NAME
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
            label: t('global:buttons.confirm'),
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
            label: t('global:buttons.cancel'),
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
