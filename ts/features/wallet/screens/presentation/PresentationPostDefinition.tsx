import { ComponentProps, useEffect, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  ClaimsSelector,
  FeatureInfo,
  FooterActions,
  ForceScrollDownView,
  H2,
  IOVisualCostants,
  ListItemCheckbox,
  ListItemHeader,
  useIOTheme,
  VSpacer,
  VStack
} from '@pagopa/io-app-design-system';
import { Alert, StyleSheet, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { useAppDispatch, useAppSelector } from '../../../../store';
import {
  Descriptor,
  selectPostDefinitionStatus,
  selectPreDefinitionStatus,
  setOptionalCredentials,
  setPostDefinitionCancel,
  setPostDefinitionRequest
} from '../../store/presentation';
import { useHeaderSecondLevel } from '../../../../hooks/useHeaderSecondLevel';
import { WalletNavigatorParamsList } from '../../navigation/WalletNavigator';
import { useDisableGestureNavigation } from '../../../../hooks/useDisableGestureNavigation';
import { useHardwareBackButton } from '../../../../hooks/useHardwareBackButton';
import { useNavigateToWalletWithReset } from '../../../../hooks/useNavigateToWalletWithReset';
import IOMarkdown from '../../../../components/IOMarkdown';
import { ItwDataExchangeIcons } from '../../components/ItwDataExchangeIcons';
import {
  ClaimDisplayFormat,
  groupCredentialsByPurpose
} from '../../utils/itwRemotePresentationUtils';
import { getClaimDisplayValue } from '../../utils/itwClaimsUtils';
import { getSafeText } from '../../../../utils/string';
import { getCredentialNameFromType } from '../../utils/itwCredentialUtils';
import { EnrichedPresentationDetails } from '../../utils/itwTypesUtils';
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
  const { navigateToWallet } = useNavigateToWalletWithReset();
  const preDef = useAppSelector(selectPreDefinitionStatus);
  const theme = useIOTheme();

  const rpConfig = preDef.success?.status
    ? preDef.success.data?.rpConfig
    : undefined;

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

  /**
   * Maps claims to the format required by the ClaimsSelector component.
   */
  const mapClaims = (
    claims: Array<ClaimDisplayFormat>
  ): ComponentProps<typeof ClaimsSelector>['items'] =>
    claims.map(c => {
      const displayResult = getClaimDisplayValue(c);

      if (displayResult.type === 'image') {
        return {
          id: c.id,
          value: displayResult.value, // This is always a string for images
          description: c.label,
          type: 'image'
        };
      }

      const textValue = Array.isArray(displayResult.value)
        ? displayResult.value.map(getSafeText).join(', ')
        : getSafeText(displayResult.value);

      return {
        id: c.id,
        value: textValue,
        description: c.label
      };
    });

  /**
   * Renders the block of credentials requested during the presentation flow.
   */
  const RequestedCredentialsBlock = ({
    credentials
  }: {
    credentials: EnrichedPresentationDetails;
  }) => {
    const visibleCredentials = credentials.filter(
      c => c.claimsToDisplay.length > 0
    );

    return (
      <VStack space={24}>
        {visibleCredentials.map((c: EnrichedPresentationDetails[number]) => {
          const credentialType = c.vct;
          const title = getCredentialNameFromType(credentialType, '');

          return (
            <ClaimsSelector
              key={c.id}
              title={title}
              items={mapClaims(c.claimsToDisplay)}
              defaultExpanded
              selectionEnabled={false}
            />
          );
        })}
      </VStack>
    );
  };

  const { required, optional } = useMemo(
    () => groupCredentialsByPurpose(route.params.descriptor.descriptor ?? []),
    [route.params.descriptor]
  );

  const sendCredentialsToMachine = (
    credentials: EnrichedPresentationDetails
  ) => {
    dispatch(setOptionalCredentials(credentials.map(c => c.id)));
  };

  return (
    <ForceScrollDownView style={styles.scroll} threshold={50}>
      <View style={{ margin: IOVisualCostants.appMarginDefault, flexGrow: 1 }}>
        <ItwDataExchangeIcons
          requesterLogoUri={
            rpConfig?.logo_uri ? { uri: rpConfig.logo_uri } : undefined
          }
        />
        <VSpacer size={24} />
        <VStack space={24}>
          <H2>{t('wallet:presentation.trust.title')}</H2>
          <IOMarkdown
            content={t('wallet:presentation.trust.subtitle', {
              relyingParty: rpConfig?.organization_name
            })}
          />
        </VStack>
        <VSpacer size={24} />
        {required.map(({ purpose, credentials }) => (
          <View key={`required:${purpose}`}>
            <ListItemHeader
              label={t('wallet:presentation.trust.requiredClaims')}
              iconName="security"
              iconColor={theme['icon-decorative']}
              description={
                purpose
                  ? t('wallet:presentation.trust.purpose', {
                      purpose
                    })
                  : undefined
              }
            />
            <RequestedCredentialsBlock credentials={credentials} />
          </View>
        ))}
        <VSpacer size={48} />
        {optional.map(({ purpose, credentials }) => (
          <View key={`optional:${purpose}`}>
            <ListItemCheckbox
              value={t('wallet:presentation.trust.optionalClaims')}
              icon="security"
              onValueChange={() => sendCredentialsToMachine(credentials)}
              description={
                purpose
                  ? t('wallet:presentation.trust.purpose', {
                      purpose
                    })
                  : undefined
              }
            />
            <RequestedCredentialsBlock credentials={credentials} />
            <VSpacer size={16} />
          </View>
        ))}
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
