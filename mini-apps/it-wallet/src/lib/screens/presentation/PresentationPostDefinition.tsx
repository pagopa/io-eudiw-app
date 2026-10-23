import {
  useDisableGestureNavigation,
  useHardwareBackButton,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
import { IOMarkdown } from '@io-eudiw-app/commons';
import {
  BodySmall,
  ContentWrapper,
  ForceScrollDownView,
  H2,
  ListItemCheckbox,
  ListItemHeader,
  useIOTheme,
  VSpacer,
  VStack
} from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { ItwDataExchangeIcons } from '../../components/ItwDataExchangeIcons';
import { ItwClaimsSelector } from '../../components/presentation/ItwClaimsSelector';
import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';
import { WalletNavigatorParamsList } from '../../navigation/wallet/WalletNavigator';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  Descriptor,
  selectPostDefinitionStatus,
  selectPreDefinitionStatus,
  setOptionalCredentials,
  setPostDefinitionCancel,
  setPostDefinitionRequest
} from '../../store/presentation';
import { groupCredentialsByPurpose } from '../../utils/itwRemotePresentationUtils';
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
  const { t } = useTranslation(['common', 'wallet']);
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

  /**
   * Checks for changes in the post definition status and navigates to the appropriate screen
   * if the operation was successful or failed.
   */
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
    goBack: cancelAlert,
    title: ''
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

          return (
            <ItwClaimsSelector
              credentialType={credentialType}
              defaultExpanded
              items={c.claimsToDisplay}
              key={c.id}
            />
          );
        })}
      </VStack>
    );
  };

  const { optional, required } = useMemo(
    () => groupCredentialsByPurpose(route.params.descriptor.descriptor ?? []),
    [route.params.descriptor]
  );

  const sendOptionalCredentials = (
    credentials: EnrichedPresentationDetails
  ) => {
    dispatch(setOptionalCredentials(credentials.map(c => c.id)));
  };

  return (
    <ForceScrollDownView
      footerActions={{
        actions: {
          primary: {
            label: t('buttons.continue'),
            loading: postDefinitionStatus.loading,
            onPress: () => dispatch(setPostDefinitionRequest([]))
          },
          secondary: {
            label: t('common:buttons.undo'),
            onPress: cancelAlert
          },
          type: 'TwoButtons'
        }
      }}
      threshold={50}
    >
      <ContentWrapper>
        <VSpacer size={24} />
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
        {required.map(({ credentials, purpose }) => (
          <View key={`required:${purpose}`}>
            <ListItemHeader
              description={
                purpose
                  ? t('wallet:presentation.trust.purpose', {
                      purpose
                    })
                  : undefined
              }
              iconColor={theme['icon-decorative']}
              iconName="security"
              label={t('wallet:presentation.trust.requiredClaims')}
            />
            <RequestedCredentialsBlock credentials={credentials} />
          </View>
        ))}
        {optional.map(({ credentials, purpose }) => (
          <View key={`optional:${purpose}`}>
            <ListItemCheckbox
              description={
                purpose
                  ? t('wallet:presentation.trust.purpose', {
                      purpose
                    })
                  : undefined
              }
              icon="security"
              onValueChange={value => {
                sendOptionalCredentials(value ? credentials : []);
              }}
              value={t('wallet:presentation.trust.optionalClaims')}
            />
            <RequestedCredentialsBlock credentials={credentials} />
            <VSpacer size={16} />
          </View>
        ))}
        <VSpacer size={24} />
        <BodySmall>{t('wallet:credentialIssuance.trust.disclaimer')}</BodySmall>
      </ContentWrapper>
    </ForceScrollDownView>
  );
};

export default PresentationPostDefinition;
