import {
  ContentWrapper,
  IOButton,
  Optional,
  VStack
} from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import {
  OperationResultScreenContent,
  usePreventScreenCapture
} from '@io-eudiw-app/commons';
import { WalletNavigatorParamsList } from '../../navigation/wallet/WalletNavigator';
import { selectCredential } from '../../store/credentials';
import { lifecycleIsValidSelector } from '../../store/lifecycle';
import { parseClaimsToRecord } from '../../utils/claims';
import { wellKnownCredential } from '../../utils/credentials';
import { getCredentialStatus } from '../../utils/itwCredentialStatusUtils';
import { getCredentialCapabilities } from '../../utils/itwCredentialCapabilities';
import { CredentialFormat, StoredCredential } from '../../utils/itwTypesUtils';
import { useAppSelector } from '../../store';
import ItwCredentialNotFound from '../../components/ItwCredentialNotFound';
import { useProximityEngagement } from '../../hooks/useProximityEngagement';
import {
  CredentialCtaProps,
  ItwPresentationDetailsScreenBase
} from '../../components/presentation/ItwPresentationDetailsScreenBase';
import { ItwPresentationCredentialUnknownStatus } from '../../components/presentation/ItwPresentationCredentialUnknownStatus';
import { ItwPresentationDetailsHeader } from '../../components/presentation/ItwPresentationDetailsHeader';
import { ItwPresentationCredentialStatusAlert } from '../../components/presentation/ItwPresentationCredentialStatusAlert';
import { ItwPresentationCredentialInfoAlert } from '../../components/presentation/ItwPresentationCredentialInfoAlert';
import { ItwPresentationClaimsSection } from '../../components/presentation/ItwPresentationClaimsSection';
import { ItwPresentationDetailsFooter } from '../../components/presentation/ItwPresentationDetailsFooter';
import { PoweredByItWalletText } from '../../components/PoweredByItWalletText';
import {
  selectIsDebugModeEnabled,
  useDebugInfo
} from '@io-eudiw-app/debug-info';
import { MainNavigatorParamsList } from '../../navigation/main/MainStackNavigator';
import WALLET_ROUTES from '../../navigation/wallet/routes';
import MAIN_ROUTES from '../../navigation/main/routes';

export type ItwPresentationCredentialDetailNavigationParams = {
  credentialType: string;
};

const credentialsWithSkeumorphicCard: ReadonlyArray<string> = [
  wellKnownCredential.DRIVING_LICENSE,
  wellKnownCredential.DISABILITY_CARD
];

type Props = StackScreenProps<
  WalletNavigatorParamsList,
  'PRESENTATION_CREDENTIAL_DETAILS'
>;

/**
 * Component that renders the credential detail screen.
 */
export const ItwPresentationCredentialDetailScreen = ({ route }: Props) => {
  const navigation =
    useNavigation<StackNavigationProp<WalletNavigatorParamsList>>();
  const { credentialType } = route.params;
  const { t } = useTranslation(['wallet', 'common']);

  const credential = useAppSelector(selectCredential(credentialType));

  const isWalletValid = useAppSelector(lifecycleIsValidSelector);

  if (!isWalletValid) {
    const ns = 'issuance.walletInstanceNotActive';

    return (
      <OperationResultScreenContent
        title={t(`${ns}.itWallet.title`)}
        subtitle={[
          { text: t(`${ns}.itWallet.body`) },
          {
            text: t(`${ns}.itWallet.bodyBold`),
            weight: 'Semibold'
          }
        ]}
        pictogram="itWallet"
        action={{
          label: t(`${ns}.primaryAction`),
          onPress: () => navigation.replace('PID_ISSUANCE_INSTANCE_CREATION')
        }}
        secondaryAction={{
          label: t(`${ns}.secondaryAction`),
          onPress: () => navigation.popToTop()
        }}
      />
    );
  }

  if (!credential) {
    // If the credential is not found, we render a screen that allows the user to request that credential.
    return (
      <ItwCredentialNotFound
        credentialType={credentialType}
        continueButtonLabel={t('common:buttons.continue')}
        cancelButtonLabel={t('common:buttons.cancel')}
      />
    );
  }
  return <ItwPresentationCredentialDetail credential={credential} />;
};

type ItwPresentationCredentialDetailProps = {
  credential: StoredCredential;
};

/**
 * Component that renders the credential detail content.
 */
const ItwPresentationCredentialDetail = ({
  credential
}: ItwPresentationCredentialDetailProps) => {
  const navigation =
    useNavigation<StackNavigationProp<MainNavigatorParamsList>>();
  const isDebugEnabled = useAppSelector(selectIsDebugModeEnabled);
  const status = getCredentialStatus(credential);
  const capabilities = getCredentialCapabilities(credential.credentialType);

  const { t } = useTranslation(['wallet', 'common']);
  const { startQrVerification } = useProximityEngagement();

  useDebugInfo(credential);

  usePreventScreenCapture(isDebugEnabled);

  const hasSkeumorphicCard = credentialsWithSkeumorphicCard.includes(
    credential.credentialType
  );

  const handleOpenCard = () => {
    navigation.navigate(MAIN_ROUTES.WALLET_NAV, {
      screen: WALLET_ROUTES.PRESENTATION.CREDENTIAL_CARD_SCREEN,
      params: { credentialType: credential.credentialType }
    });
  };

  // The proximity verification CTA is only available for mdoc credentials
  // (currently only the mDL), which are the ones presentable over proximity.
  const ctaProps = useMemo<Optional<CredentialCtaProps>>(() => {
    if (credential.format === CredentialFormat.MDOC) {
      return {
        label: t('wallet:presentation.ctas.present'),
        icon: 'productITWallet',
        iconPosition: 'end',
        onPress: () => void startQrVerification()
      };
    }

    return undefined;
  }, [credential.format, startQrVerification, t]);

  const parsedClaims = useMemo(
    () => parseClaimsToRecord(credential.parsedCredential),
    [credential.parsedCredential]
  );

  if (status === 'unknown') {
    return <ItwPresentationCredentialUnknownStatus credential={credential} />;
  }

  return (
    <ItwPresentationDetailsScreenBase
      credential={credential}
      ctaProps={ctaProps}
      headerTransparent
    >
      <ItwPresentationDetailsHeader
        credential={credential}
        capabilities={capabilities}
      />
      <View style={{ paddingVertical: 16 }}>
        {hasSkeumorphicCard && (
          <View style={{ alignSelf: 'center', paddingVertical: 8 }}>
            <IOButton
              variant="link"
              label={t('presentation.credentialDetails.openCardDocument')}
              icon="creditCard"
              iconPosition="start"
              onPress={handleOpenCard}
            />
          </View>
        )}
      </View>
      <ContentWrapper>
        <VStack space={24}>
          <ItwPresentationCredentialStatusAlert
            credential={credential}
            suppressStatusAlert={capabilities.suppressStatusAlert}
          />
          <ItwPresentationCredentialInfoAlert
            credential={credential}
            infoAlert={capabilities.infoAlert}
          />
          <ItwPresentationClaimsSection
            credential={credential}
            parsedClaims={parsedClaims}
          />
          <ItwPresentationDetailsFooter
            credential={credential}
            capabilities={capabilities}
          />
          <View style={{ alignItems: 'center' }}>
            <PoweredByItWalletText />
          </View>
        </VStack>
      </ContentWrapper>
    </ItwPresentationDetailsScreenBase>
  );
};
