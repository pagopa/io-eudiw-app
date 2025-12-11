import { useEffect, useMemo, useState } from 'react';
import { Alert, View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import {
  Body,
  FeatureInfo,
  FooterActions,
  ForceScrollDownView,
  H2,
  HSpacer,
  Icon,
  IOVisualCostants,
  VSpacer,
  Alert as AlertDs
} from '@pagopa/io-app-design-system';
import { AcceptedFields } from '@pagopa/io-react-native-proximity';
import { useNavigation } from '@react-navigation/native';
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
import { WalletNavigatorParamsList } from '../../navigation/WalletNavigator';
import { useDisableGestureNavigation } from '../../../../hooks/useDisableGestureNavigation';
import { useHardwareBackButton } from '../../../../hooks/useHardwareBackButton';
import { useHeaderSecondLevel } from '../../../../hooks/useHeaderSecondLevel';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { useNavigateToWalletWithReset } from '../../../../hooks/useNavigateToWalletWithReset';
import { useDebugInfo } from '../../../../hooks/useDebugInfo';
import { selectIsDebugModeEnabled } from '../../../../store/reducers/debug';
import CredentialTypePresentationClaimsList from '../../components/presentation/CredentialTypePresentationClaimsList';

export type PresentationProximityPreviewProps = ProximityDisclosure;

type Props = NativeStackScreenProps<
  WalletNavigatorParamsList,
  'PROXIMITY_PREVIEW'
>;

/**
 * Screen that shows the claims required for a Proximity presentation
 * and handles presentation completion or cancellation
 */
const PresentationProximityPreview = ({ route }: Props) => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { navigateToWallet } = useNavigateToWalletWithReset();
  const proximityStatus = useAppSelector(selectProximityStatus);
  const { t } = useTranslation(['global', 'wallet']);
  const isDebug = useAppSelector(selectIsDebugModeEnabled);
  const isAuthenticated = route.params.isAuthenticated;

  const proximityErrorDetails = useAppSelector(selectProximityErrorDetails);
  const verifierRequest = useAppSelector(selectProximityDocumentRequest);

  const baseCheckState = useMemo(() => {
    const credentialsBool = Object.entries(route.params.descriptor).map(
      ([credType, namespaces]) => {
        const namespacesBool = Object.entries(namespaces).map(
          ([namespace, attributes]) => {
            const attributesBool = Object.fromEntries(
              Object.keys(attributes).map(key => [key, true])
            );
            return [namespace, attributesBool];
          }
        );
        return [credType, Object.fromEntries(namespacesBool)];
      }
    );
    return Object.fromEntries(credentialsBool);
  }, [route.params.descriptor]);

  const [checkState, setCheckState] = useState<AcceptedFields>(baseCheckState);

  useDebugInfo({
    isAuthenticated,
    proximityDisclosureDescriptorPreview: route.params.descriptor,
    acceptedFields: checkState,
    verifierRequest,
    proximityStatusPreview: proximityStatus,
    proximityErrorDetailsPreview: proximityErrorDetails ?? 'No errors'
  });

  useEffect(() => {
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
  }, [proximityStatus, navigation]);

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
        <VSpacer size={24} />
        <View style={styles.header}>
          <Icon name={'device'} color={'grey-450'} size={24} />
          <HSpacer size={8} />
          <Icon name={'transactions'} color={'grey-450'} size={24} />
          <HSpacer size={8} />
          <Icon name={'device'} color={'grey-450'} size={24} />
        </View>
        <VSpacer size={24} />
        <H2>{t('wallet:presentation.trust.title')}</H2>
        <Body> {t('wallet:presentation.trust.subtitle')}</Body>
        <VSpacer size={24} />
        {isDebug && <IsAuthenticatedAlert />}
        <CredentialTypePresentationClaimsList
          optionalSection={{
            optionalDescriptor: route.params.descriptor,
            optionalCheckState: checkState,
            setOptionalCheckState: setCheckState
          }}
          showMandatoryHeader={false}
          showOptionalHeader={false}
        />
        <VSpacer size={24} />
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
              dispatch(setProximityStatusAuthorizationSend(checkState));
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
  header: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  scroll: {
    flexGrow: 1
  }
});

export default PresentationProximityPreview;
