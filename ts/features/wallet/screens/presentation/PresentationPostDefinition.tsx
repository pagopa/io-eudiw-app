import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  FeatureInfo,
  FooterActions,
  ForceScrollDownView,
  H2,
  IOVisualCostants,
  VSpacer,
  VStack
} from '@pagopa/io-app-design-system';
import { Alert, StyleSheet, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { useAppDispatch, useAppSelector } from '../../../../store';
import {
  Descriptor,
  selectPostDefinitionStatus,
  selectRelyingPartyData,
  setPostDefinitionCancel,
  setPostDefinitionRequest
} from '../../store/presentation';
import { useHeaderSecondLevel } from '../../../../hooks/useHeaderSecondLevel';
import { WalletNavigatorParamsList } from '../../navigation/WalletNavigator';
import { useDisableGestureNavigation } from '../../../../hooks/useDisableGestureNavigation';
import { useHardwareBackButton } from '../../../../hooks/useHardwareBackButton';
import { useNavigateToWalletWithReset } from '../../../../hooks/useNavigateToWalletWithReset';
import CredentialTypePresentationClaimsList from '../../components/presentation/CredentialTypePresentationClaimsList';
import IOMarkdown from '../../../../components/IOMarkdown';
import { ItwDataExchangeIcons } from '../../components/ItwDataExchangeIcons';
/**
 * Description which contains the requested of the credential to be presented.
 */
export type PresentationPostDefinitionParams = {
  descriptor: Descriptor;
};

type Props = StackScreenProps<
  WalletNavigatorParamsList,
  'PRESENTATION_POST_DEFINITION'
>;

/**
 * Presentation for the issuance flow after the user has received the descriptor containing the requested claims.
 * It requires the descrptor containg the requested claims in order to render the screen, passed via navigation params.
 */
const PresentationPostDefinition = ({ route }: Props) => {
  const navigation = useNavigation();
  const { t } = useTranslation(['global', 'wallet']);
  const dispatch = useAppDispatch();
  const postDefinitionStatus = useAppSelector(selectPostDefinitionStatus);
  const rpData = useAppSelector(selectRelyingPartyData);
  const { navigateToWallet } = useNavigateToWalletWithReset();

  // Disable the back gesture navigation and the hardware back button
  useDisableGestureNavigation();
  useHardwareBackButton(() => true);

  const cancel = () => {
    dispatch(setPostDefinitionCancel());
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

  /**
   * Checks for changes in the post definition status and navigates to the appropriate screen
   * if the operation was successful or failed.
   */
  useEffect(() => {
    if (postDefinitionStatus.success.status) {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'PRESENTATION_SUCCESS'
      });
    } else if (postDefinitionStatus.error.status) {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'PRESENTATION_FAILURE'
      });
    }
  }, [
    navigation,
    postDefinitionStatus.error.status,
    postDefinitionStatus.success.status
  ]);

  useHeaderSecondLevel({
    title: '',
    goBack: cancelAlert
  });

  const requiredDisclosures = route.params.descriptor;

  return (
    <ForceScrollDownView style={styles.scroll} threshold={50}>
      <View style={{ margin: IOVisualCostants.appMarginDefault, flexGrow: 1 }}>
        <ItwDataExchangeIcons
          requesterLogoUri={
            rpData?.logo_uri ? { uri: rpData.logo_uri } : undefined
          }
        />
        <VSpacer size={24} />
        <VStack space={24}>
          <H2>{t('wallet:presentation.trust.title')}</H2>
          <IOMarkdown
            content={t('wallet:presentation.trust.subtitle', {
              relyingParty: rpData?.organization_name
            })}
          />
        </VStack>
        <VSpacer size={24} />
        <CredentialTypePresentationClaimsList
          mandatoryDescriptor={requiredDisclosures}
        />
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
        <VSpacer size={48} />
        <IOMarkdown
          content={t('wallet:presentation.trust.tos', {
            privacyUrl: rpData?.policy_uri
          })}
        />
      </View>
      <FooterActions
        fixed={false}
        actions={{
          type: 'TwoButtons',
          primary: {
            label: t('global:buttons.continue'),
            onPress: () => dispatch(setPostDefinitionRequest([])),
            loading: postDefinitionStatus.loading
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

export default PresentationPostDefinition;
