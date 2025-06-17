import React, {useEffect, useMemo, useState} from 'react';
import {Alert, View, StyleSheet} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {
  Body,
  FeatureInfo,
  FooterActions,
  ForceScrollDownView,
  H2,
  HSpacer,
  Icon,
  IOVisualCostants,
  VSpacer
} from '@pagopa/io-app-design-system';
import {AcceptedFields} from '@pagopa/io-react-native-proximity';
import {useNavigation} from '@react-navigation/native';
import {
  ProximityDisclosureDescriptor,
  ProximityStatus,
  resetProximity,
  selectProximityStatus,
  setProximityStatusAuthorizationRejected,
  setProximityStatusAuthorizationSend
} from '../../store/proximity';
import {WalletNavigatorParamsList} from '../../navigation/WalletNavigator';
import ProximityClaimsList from '../../components/proximity/ProximityClaimsList';
import {useDisableGestureNavigation} from '../../../../hooks/useDisableGestureNavigation';
import {useHardwareBackButton} from '../../../../hooks/useHardwareBackButton';
import {useHeaderSecondLevel} from '../../../../hooks/useHeaderSecondLevel';
import {useAppDispatch, useAppSelector} from '../../../../store';
import {useNavigateToWalletWithReset} from '../../../../hooks/useNavigateToWalletWithReset';

export type PresentationProximityPreviewProps = {
  descriptor: ProximityDisclosureDescriptor;
};

type Props = NativeStackScreenProps<
  WalletNavigatorParamsList,
  'PROXIMITY_PREVIEW'
>;

/**
 * Screen that shows the claims required for a Proximity presentation
 * and handles presentation completion or cancellation
 */
const PresentationProximityPreview = ({route}: Props) => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const {navigateToWallet} = useNavigateToWalletWithReset();
  const proximityStatus = useAppSelector(selectProximityStatus);
  const {t} = useTranslation(['global', 'wallet']);

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

  useEffect(() => {
    // Handle navigation based on the proximity presentation result
    if (proximityStatus === ProximityStatus.PROXIMITY_STATUS_AUTHORIZATION_COMPLETE) {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'PROXIMITY_SUCCESS'
      });
    } else if (proximityStatus === ProximityStatus.PROXIMITY_STATUS_ABORTED || proximityStatus === ProximityStatus.PROXIMITY_STATUS_ERROR) {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'PROXIMITY_FAILURE'
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

  useHeaderSecondLevel({
    title: '',
    goBack: cancelAlert
  });

  return (
    <ForceScrollDownView style={styles.scroll}>
      <View style={{margin: IOVisualCostants.appMarginDefault, flexGrow: 1}}>
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
        <ProximityClaimsList
          descriptor={route.params.descriptor}
          checkState={checkState}
          setCheckState={setCheckState}
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
              proximityStatus === ProximityStatus.PROXIMITY_STATUS_AUTHORIZATION_SEND ||
              proximityStatus === ProximityStatus.PROXIMITY_STATUS_AUTHORIZATION_COMPLETE
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
