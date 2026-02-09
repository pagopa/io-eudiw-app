/* eslint-disable import/no-named-as-default-member */
import { Alert, IOButton, IOToast, VStack } from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import I18n from 'i18next';
import { memo, useCallback } from 'react';
import { View } from 'react-native';
import IOMarkdown from '../../../../components/IOMarkdown';
import { useIOBottomSheetModal } from '../../../../hooks/useBottomSheet';
import { MainNavigatorParamsList } from '../../../../navigation/main/MainStackNavigator';
import { useAppSelector } from '../../../../store';
import { openWebUrl } from '../../../../utils/url';
import { useItwRemoveCredentialWithConfirm } from '../../hooks/useItwRemoveCredentialWithConfirm';
import { itwCredentialsPidStatusSelector } from '../../store/credentials';
import { itwCredentialStatusSelector } from '../../store/selectors/wallet';
import {
  wellKnownCredential,
  WellKnownCredentialTypes
} from '../../utils/credentials';
import { format } from '../../utils/dates';
import { getCredentialExpireDays } from '../../utils/itwClaimsUtils';
import {
  ItwCredentialStatus,
  ItwJwtCredentialStatus,
  StoredCredential
} from '../../utils/itwTypesUtils';
import { ClaimsLocales, getClaimsFullLocale } from '../../utils/locale';
import { ItwPidLifecycleAlert } from '../ItwPidLifecycleAlert';

type Props = {
  credential: StoredCredential;
};

const excludedCredentialTypes = [
  wellKnownCredential.PID,
  wellKnownCredential.HEALTHID
] satisfies Array<WellKnownCredentialTypes>;

type ExcludedCredentialTypes = (typeof excludedCredentialTypes)[number];

const LICENSE_RENEWAL_URL = 'https://www.mit.gov.it/rinnovo-patente';

type CredentialAlertEvents = 'tap_banner' | 'open_bottom_sheet' | 'press_cta';

export type TrackCredentialAlert = (action: CredentialAlertEvents) => void;

type CredentialStatusAlertProps = {
  credential: StoredCredential;
  status?: ItwCredentialStatus;
};

export enum CredentialAlertType {
  PID_LIFECYCLE = 'PID_LIFECYCLE',
  JWT_VERIFICATION = 'JWT_VERIFICATION',
  DOCUMENT_EXPIRING = 'DOCUMENT_EXPIRING',
  ISSUER_DYNAMIC_ERROR = 'ISSUER_DYNAMIC_ERROR',
  DOCUMENT_EXPIRED = 'DOCUMENT_EXPIRED'
}

type CredentialAlertProps = {
  eidStatus: ItwJwtCredentialStatus | undefined;
  credentialStatus: ItwCredentialStatus | undefined;
  message: Record<string, { title: string; description: string }> | undefined;
};

const useAlertPressHandler = (bottomSheet: { present: () => void }) => () => {
  bottomSheet.present();
};

// Helper function that calculates which alert type should be shown.
export const deriveCredentialAlertType = (
  props: CredentialAlertProps
): CredentialAlertType | undefined => {
  const { eidStatus, credentialStatus, message } = props;

  const isEidExpired = eidStatus === 'jwtExpired';
  const isEidExpiring = eidStatus === 'jwtExpiring';
  const isCredentialJwtExpiring = credentialStatus === 'jwtExpiring';
  const isCredentialJwtExpired = credentialStatus === 'jwtExpired';

  const isEidInvalid = isEidExpired || isEidExpiring;
  const isCredentialJwtInvalid =
    isCredentialJwtExpiring || isCredentialJwtExpired;

  // Handle alerts only if the credential JWT is expiring or expired
  if (isCredentialJwtInvalid) {
    /**
     * 1. Don't show any alert if the eID is expired or expiring AND the credential JWT is expiring
     */
    const shouldHideAlert = isEidInvalid && isCredentialJwtExpiring;

    if (shouldHideAlert) {
      return undefined;
    }

    // 2. In all other cases where the JWT is invalid but no special condition applies,
    // show the generic JWT verification alert
    return CredentialAlertType.JWT_VERIFICATION;
  }

  // 3. If the credential status is "expiring", show the Document Expiring alert
  if (credentialStatus === 'expiring') {
    return CredentialAlertType.DOCUMENT_EXPIRING;
  }

  // 4. If there is a dynamic message provided by the issuer, show the Issuer Dynamic Error alert
  if (message) {
    return CredentialAlertType.ISSUER_DYNAMIC_ERROR;
  }

  // 5. Fallback when the issuer does not provide a message for an expired credential
  if (credentialStatus === 'expired') {
    return CredentialAlertType.DOCUMENT_EXPIRED;
  }

  return undefined;
};

/**
 * This component renders an alert related to the credential status (expiring or invalid).
 * It contains messages that are statically defined in the app's locale or
 * dynamically extracted from the issuer configuration.
 */
const ItwPresentationCredentialStatusAlert = ({ credential }: Props) => {
  const navigation =
    useNavigation<StackNavigationProp<MainNavigatorParamsList>>();
  const eidStatus = useAppSelector(itwCredentialsPidStatusSelector);
  const { status, message } = useAppSelector(state =>
    itwCredentialStatusSelector(state, credential.credentialType)
  );

  const alertType = deriveCredentialAlertType({
    eidStatus,
    credentialStatus: status,
    message
  });

  if (!alertType) {
    return null;
  }

  switch (alertType) {
    case CredentialAlertType.PID_LIFECYCLE:
      return <ItwPidLifecycleAlert navigation={navigation} />;
    case CredentialAlertType.JWT_VERIFICATION:
      return <JwtVerificationAlert credential={credential} status={status} />;
    case CredentialAlertType.DOCUMENT_EXPIRING:
      return <DocumentExpiringAlert credential={credential} />;
    case CredentialAlertType.ISSUER_DYNAMIC_ERROR:
      return (
        <IssuerDynamicErrorAlert message={message!} credential={credential} />
      );
    case CredentialAlertType.DOCUMENT_EXPIRED:
      return (
        <Alert
          testID="itwExpiredBannerTestID"
          variant="error"
          content={I18n.t('presentation.alerts.expired.content', {
            ns: 'wallet'
          })}
        />
      );
  }
};

const JwtVerificationAlert = ({
  credential,
  status
}: CredentialStatusAlertProps) => {
  const isExpired = status === 'jwtExpired';

  const beginCredentialIssuance = () => {
    // TODO: Evaluate if reissuance is necessary
  };

  return (
    <Alert
      testID="itwExpiringBannerTestID"
      variant={isExpired ? 'error' : 'warning'}
      content={I18n.t(
        `presentation.alerts.jwtVerification.content.${
          isExpired ? 'jwtExpired' : 'jwtExpiring'
        }`,
        {
          ns: 'wallet',
          date: format(credential.expiration, 'DD-MM-YYYY')
        }
      )}
      action={I18n.t('presentation.alerts.jwtVerification.action', {
        ns: 'wallet'
      })}
      onPress={beginCredentialIssuance}
    />
  );
};

const DocumentExpiringAlert = ({ credential }: CredentialStatusAlertProps) => {
  const expireDays = getCredentialExpireDays(credential.parsedCredential);
  const showCta =
    credential.credentialType === wellKnownCredential.DRIVING_LICENSE;

  const bottomSheetNs = `presentation.bottomSheets.${
    credential.credentialType as Exclude<
      WellKnownCredentialTypes,
      ExcludedCredentialTypes
    >
  }.expiring` as const;

  const handleCtaPress = useCallback(() => {
    openWebUrl(LICENSE_RENEWAL_URL, () =>
      IOToast.error(I18n.t('errors.generic', { ns: 'global' }))
    );
  }, []);

  const bottomSheet = useIOBottomSheetModal({
    //    title: I18n.t(`${bottomSheetNs}.title`, { ns: 'wallet' }),
    // This API is needed to bypass translation engine interpretations of ":" symbols as namespaces
    title: I18n.getResource(I18n.language, 'wallet', `${bottomSheetNs}.title`),
    component: (
      <VStack space={24}>
        <IOMarkdown
          content={I18n.getResource(
            I18n.language,
            'wallet',
            `${bottomSheetNs}.content`
          )}
        />
        {showCta && (
          <View style={{ marginBottom: 16 }}>
            <IOButton
              variant="outline"
              fullWidth
              label={I18n.t(
                'presentation.bottomSheets.org.iso.18013.5.1.mDL.expiring.cta',
                {
                  ns: 'wallet'
                }
              )}
              onPress={handleCtaPress}
            />
          </View>
        )}
      </VStack>
    )
  });

  const handleAlertPress = useAlertPressHandler(bottomSheet);

  return (
    <>
      <Alert
        testID="itwExpiringBannerTestID"
        variant="warning"
        content={I18n.t('presentation.alerts.expiring.content', {
          ns: 'wallet',
          days: expireDays
        })}
        action={I18n.t('presentation.alerts.statusAction', { ns: 'wallet' })}
        onPress={handleAlertPress}
      />
      {bottomSheet.bottomSheet}
    </>
  );
};

type IssuerDynamicErrorAlertProps = {
  message: Record<string, { title: string; description: string }>;
  credential: StoredCredential;
};

const IssuerDynamicErrorAlert = ({
  message,
  credential
}: IssuerDynamicErrorAlertProps) => {
  const localizedMessage = getLocalizedMessageOrFallback(message);
  const showCta =
    credential.credentialType === wellKnownCredential.DRIVING_LICENSE;

  const { confirmAndRemoveCredential } =
    useItwRemoveCredentialWithConfirm(credential);

  const bottomSheet = useIOBottomSheetModal({
    title: localizedMessage.title,
    component: (
      <VStack space={24}>
        <IOMarkdown content={localizedMessage.description} />
        {showCta && (
          <View style={{ marginBottom: 16 }}>
            <IOButton
              variant="solid"
              fullWidth
              label={I18n.t('presentation.alerts.mdl.invalid.cta', {
                ns: 'wallet'
              })}
              onPress={confirmAndRemoveCredential}
            />
          </View>
        )}
      </VStack>
    )
  });

  const handleAlertPress = useAlertPressHandler(bottomSheet);

  return (
    <>
      <Alert
        variant="error"
        content={localizedMessage.title}
        action={I18n.t('presentation.alerts.statusAction', { ns: 'wallet' })}
        onPress={handleAlertPress}
      />
      {bottomSheet.bottomSheet}
    </>
  );
};

const getLocalizedMessageOrFallback = (
  message: IssuerDynamicErrorAlertProps['message']
) =>
  message
    ? (message[getClaimsFullLocale()] ??
      message[ClaimsLocales.it] ?? {
        title: I18n.t('credentials.status.unknown', { ns: 'wallet' }),
        description: I18n.t('credentials.status.unknown', { ns: 'wallet' })
      })
    : {
        title: I18n.t('credentials.status.unknown', { ns: 'wallet' }),
        description: I18n.t('credentials.status.unknown', { ns: 'wallet' })
      };

const Memoized = memo(ItwPresentationCredentialStatusAlert);

export { Memoized as ItwPresentationCredentialStatusAlert };
