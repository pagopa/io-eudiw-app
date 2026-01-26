import {
  ContentWrapper,
  Optional,
  VSpacer,
  VStack
} from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import I18n from 'i18next';
import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { WalletNavigatorParamsList } from '../../navigation/WalletNavigator';
import { useDebugInfo } from '../../../../hooks/useDebugInfo';
import { selectCredential } from '../../store/credentials';
import { lifecycleIsValidSelector } from '../../store/lifecycle';
import { OperationResultScreenContent } from '../../../../components/screens/OperationResultScreenContent';
import { MainNavigatorParamsList } from '../../../../navigation/main/MainStackNavigator';
import MAIN_ROUTES from '../../../../navigation/main/routes';
import WALLET_ROUTES from '../../navigation/routes';
import ItwCredentialNotFound from '../../components/ItwCredentialNotFound';
import { getCredentialStatus } from '../../utils/itwCredentialStatusUtils';
// import { usePreventScreenCapture } from '../../../../hooks/usePreventScreenCapture';
import {
  CredentialCtaProps,
  ItwPresentationDetailsScreenBase
} from '../../components/presentation/ItwPresentationDetailsScreenBase';
import { ItwPresentationCredentialUnknownStatus } from '../../components/presentation/ItwPresentationCredentialUnknownStatus';
import { ItwPresentationDetailsHeader } from '../../components/presentation/ItwPresentationDetailsHeader';
import { PoweredByItWalletText } from '../../components/PoweredByItWalletText';
import { ItwPresentationCredentialStatusAlert } from '../../components/presentation/ItwPresentationCredentialStatusAlert';
import { ItwPresentationCredentialInfoAlert } from '../../components/presentation/ItwPresentationCredentialInfoAlert';
import { ItwPresentationClaimsSection } from '../../components/presentation/ItwPresentationClaimsSection';
import { ItwPresentationDetailsFooter } from '../../components/presentation/ItwPresentationDetailsFooter';
import { wellKnownCredential } from '../../utils/credentials';
import { useIOBottomSheetModal } from '../../../../hooks/useBottomSheet';
import { PresentationProximityQrCode } from '../../components/proximity/PresentationProximityQRCode';
import {
  ProximityStatus,
  resetProximity,
  selectProximityDisclosureDescriptor,
  selectProximityErrorDetails,
  selectProximityStatus,
  setProximityStatusStarted,
  setProximityStatusStopped
} from '../../store/proximity';
import { RootStackParamList } from '../../../../navigation/RootStacknavigator';
import { StoredCredential } from '../../utils/itwTypesUtils';
import { parseClaimsToRecord } from '../../utils/claims';

export type ItwPresentationCredentialDetailNavigationParams = {
  credentialType: string;
};

type Props = StackScreenProps<
  WalletNavigatorParamsList,
  'PRESENTATION_CREDENTIAL_DETAILS'
>;

/**
 * Component that renders the credential detail screen.
 */
export const ItwPresentationCredentialDetailScreen = ({ route }: Props) => {
  const navigation =
    useNavigation<StackNavigationProp<MainNavigatorParamsList>>();
  const { credentialType } = route.params;

  const credential = useAppSelector(selectCredential(credentialType));

  const isWalletValid = useAppSelector(lifecycleIsValidSelector);

  if (!isWalletValid) {
    const ns = 'issuance.walletInstanceNotActive';

    return (
      <OperationResultScreenContent
        title={I18n.t(`${ns}.itWallet.title`, { ns: 'wallet' })}
        subtitle={[
          { text: I18n.t(`${ns}.itWallet.body`, { ns: 'wallet' }) },
          {
            text: I18n.t(`${ns}.itWallet.bodyBold`, { ns: 'wallet' }),
            weight: 'Semibold'
          }
        ]}
        pictogram="itWallet"
        action={{
          label: I18n.t(`${ns}.primaryAction`, { ns: 'wallet' }),
          onPress: () =>
            navigation.replace(MAIN_ROUTES.WALLET_NAV, {
              screen: WALLET_ROUTES.PID_ISSUANCE.INSTANCE_CREATION
            })
        }}
        secondaryAction={{
          label: I18n.t(`${ns}.secondaryAction`, { ns: 'wallet' }),
          onPress: () => navigation.popToTop()
        }}
      />
    );
  }

  if (!credential) {
    // If the credential is not found, we render a screen that allows the user to request that credential.
    return <ItwCredentialNotFound credentialType={credentialType} />;
  }
  return (
    <>
      <ItwPresentationCredentialDetail credential={credential} />
    </>
  );
};

type ItwPresentationCredentialDetailProps = {
  credential: StoredCredential;
};

/**
 * Component that renders the credential detail content.
 */
export const ItwPresentationCredentialDetail = ({
  credential
}: ItwPresentationCredentialDetailProps) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const status = getCredentialStatus(credential);

  const { t } = useTranslation(['wallet']);

  useDebugInfo(credential);
  // usePreventScreenCapture();

  const proximityStatus = useAppSelector(selectProximityStatus);
  const proximityDisclosureDescriptor = useAppSelector(
    selectProximityDisclosureDescriptor
  );
  const proximityErrorDetails = useAppSelector(selectProximityErrorDetails);

  const dispatch = useAppDispatch();

  useDebugInfo(
    credential.format === 'mso_mdoc'
      ? {
          proximityDisclosureDescriptorQR: proximityDisclosureDescriptor,
          proximityStatusQR: proximityStatus,
          proximityErrorDetailsQR: proximityErrorDetails ?? 'No errors'
        }
      : {}
  );

  const QrCodeModal = useIOBottomSheetModal({
    title: t('wallet:proximity.showQr.title'),
    component: <PresentationProximityQrCode navigation={navigation} />,
    onDismiss: () => {
      // In case the flow is stopped before receiving a document
      if (proximityStatus === ProximityStatus.PROXIMITY_STATUS_STARTED) {
        dispatch(setProximityStatusStopped());
        dispatch(resetProximity());
      }
    }
  });

  useEffect(() => {
    // These states indicate that the modal can be dismissed
    if (
      proximityStatus === ProximityStatus.PROXIMITY_STATUS_RECEIVED_DOCUMENT ||
      proximityStatus === ProximityStatus.PROXIMITY_STATUS_ERROR ||
      proximityStatus === ProximityStatus.PROXIMITY_STATUS_ABORTED
    ) {
      QrCodeModal.dismiss();
    }
  }, [proximityStatus, QrCodeModal, navigation]);

  const ctaProps = useMemo<Optional<CredentialCtaProps>>(() => {
    const credentialType = credential.credentialType;

    if (credentialType === wellKnownCredential.DRIVING_LICENSE) {
      return {
        label: I18n.t('presentation.ctas.showQRCode', { ns: 'wallet' }),
        icon: 'qrCode',
        iconPosition: 'end',
        loading: false,
        onPress: () => {
          dispatch(setProximityStatusStarted());
          QrCodeModal.present();
        }
      };
    }

    return undefined;
  }, [credential, QrCodeModal, dispatch]);

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
    >
      <ItwPresentationDetailsHeader
        credential={credential}
        parsedClaims={parsedClaims}
      />
      <VSpacer size={24} />
      <ContentWrapper>
        <VStack space={24}>
          <ItwPresentationCredentialStatusAlert credential={credential} />
          <ItwPresentationCredentialInfoAlert credential={credential} />
          <ItwPresentationClaimsSection
            credential={credential}
            parsedClaims={parsedClaims}
          />
          <ItwPresentationDetailsFooter credential={credential} />
          <View style={{ alignItems: 'center' }}>
            <PoweredByItWalletText />
          </View>
          {QrCodeModal.bottomSheet}
        </VStack>
      </ContentWrapper>
    </ItwPresentationDetailsScreenBase>
  );
};
