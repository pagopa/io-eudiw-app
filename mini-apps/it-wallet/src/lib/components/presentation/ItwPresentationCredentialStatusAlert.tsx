import {
  IOMarkdown,
  openWebUrl,
  useIOBottomSheetModal
} from '@io-eudiw-app/commons';
import { Alert, IOButton, IOToast, VStack } from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import I18n from 'i18next';
import { memo, useCallback } from 'react';
import { View } from 'react-native';

import { useItwRemoveCredentialWithConfirm } from '../../hooks/useItwRemoveCredentialWithConfirm';
import { MainNavigatorParamsList } from '../../navigation/main/MainStackNavigator';
import { useAppSelector } from '../../store';
import { itwCredentialsPidStatusSelector } from '../../store/credentials';
import { itwCredentialStatusSelector } from '../../store/selectors/wallet';
import { wellKnownCredential } from '../../utils/credentials';
import { format } from '../../utils/dates';
import { getCredentialExpireDays } from '../../utils/itwClaimsUtils';
import {
  ItwCredentialStatus,
  ItwJwtCredentialStatus,
  StoredCredentialMetadata
} from '../../utils/itwTypesUtils';
import { ClaimsLocales, getClaimsFullLocale } from '../../utils/locale';
import { ItwPidLifecycleAlert } from '../ItwPidLifecycleAlert';

type Props = {
  credential: StoredCredentialMetadata;
  suppressStatusAlert: boolean;
};

const LICENSE_RENEWAL_URL = 'https://www.mit.gov.it/rinnovo-patente';

enum CredentialAlertType {
  DOCUMENT_EXPIRED = 'DOCUMENT_EXPIRED',
  DOCUMENT_EXPIRING = 'DOCUMENT_EXPIRING',
  ISSUER_DYNAMIC_ERROR = 'ISSUER_DYNAMIC_ERROR',
  JWT_VERIFICATION = 'JWT_VERIFICATION',
  PID_LIFECYCLE = 'PID_LIFECYCLE'
}

type CredentialAlertProps = {
  credentialStatus: ItwCredentialStatus | undefined;
  eidStatus: ItwJwtCredentialStatus | undefined;
  message: Record<string, { description: string; title: string }> | undefined;
};

type CredentialStatusAlertProps = {
  credential: StoredCredentialMetadata;
  status?: ItwCredentialStatus;
};

const useAlertPressHandler = (bottomSheet: { present: () => void }) => () => {
  bottomSheet.present();
};

// Helper function that calculates which alert type should be shown.
const deriveCredentialAlertType = (
  props: CredentialAlertProps
): CredentialAlertType | undefined => {
  const { credentialStatus, eidStatus, message } = props;

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
const ItwPresentationCredentialStatusAlert = ({
  credential,
  suppressStatusAlert
}: Props) => {
  const navigation =
    useNavigation<StackNavigationProp<MainNavigatorParamsList>>();
  const eidStatus = useAppSelector(itwCredentialsPidStatusSelector);
  const { message, status } = useAppSelector(state =>
    itwCredentialStatusSelector(state, credential.credentialType)
  );

  // Credentials with a dedicated info banner (e.g. Bonus Pari, whose 15-day
  // validity would otherwise trigger the generic expiring banner) suppress
  // the generic status alert.
  if (suppressStatusAlert) {
    return null;
  }

  const alertType = deriveCredentialAlertType({
    credentialStatus: status,
    eidStatus,
    message
  });

  if (!alertType) {
    return null;
  }

  switch (alertType) {
    case CredentialAlertType.DOCUMENT_EXPIRED:
      return (
        <Alert
          content={I18n.t('presentation.alerts.expired.content', {
            ns: 'wallet'
          })}
          testID="itwExpiredBannerTestID"
          variant="error"
        />
      );
    case CredentialAlertType.DOCUMENT_EXPIRING:
      return <DocumentExpiringAlert credential={credential} />;
    case CredentialAlertType.ISSUER_DYNAMIC_ERROR:
      return (
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        <IssuerDynamicErrorAlert credential={credential} message={message!} />
      );
    case CredentialAlertType.JWT_VERIFICATION:
      return <JwtVerificationAlert credential={credential} status={status} />;
    case CredentialAlertType.PID_LIFECYCLE:
      return <ItwPidLifecycleAlert navigation={navigation} />;
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
      action={I18n.t('presentation.alerts.jwtVerification.action', {
        ns: 'wallet'
      })}
      content={I18n.t(
        `presentation.alerts.jwtVerification.content.${
          isExpired ? 'jwtExpired' : 'jwtExpiring'
        }`,
        {
          date: format(credential.expiration, 'DD-MM-YYYY'),
          ns: 'wallet'
        }
      )}
      onPress={beginCredentialIssuance}
      testID="itwExpiringBannerTestID"
      variant={isExpired ? 'error' : 'warning'}
    />
  );
};

const DocumentExpiringAlert = ({ credential }: CredentialStatusAlertProps) => {
  const expireDays = getCredentialExpireDays(credential.parsedCredential);
  const showCta =
    credential.credentialType === wellKnownCredential.DRIVING_LICENSE;

  const bottomSheetNs = `presentation.bottomSheets.${credential.credentialType}.expiring`;

  const handleCtaPress = useCallback(() => {
    openWebUrl(LICENSE_RENEWAL_URL, () =>
      IOToast.error(I18n.t('errors.generic', { ns: 'common' }))
    );
  }, []);

  const bottomSheet = useIOBottomSheetModal({
    closeAccessibilityLabel: I18n.t('buttons.close', { ns: 'common' }),
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
              fullWidth
              label={I18n.t(
                'presentation.bottomSheets.org.iso.18013.5.1.mDL.expiring.cta',
                {
                  ns: 'wallet'
                }
              )}
              onPress={handleCtaPress}
              variant="outline"
            />
          </View>
        )}
      </VStack>
    ),
    //    title: I18n.t(`${bottomSheetNs}.title`, { ns: 'wallet' }),
    // This API is needed to bypass translation engine interpretations of ":" symbols as namespaces
    title: I18n.getResource(I18n.language, 'wallet', `${bottomSheetNs}.title`)
  });

  const handleAlertPress = useAlertPressHandler(bottomSheet);

  return (
    <>
      <Alert
        action={I18n.t('presentation.alerts.statusAction', { ns: 'wallet' })}
        content={I18n.t('presentation.alerts.expiring.content', {
          days: expireDays,
          ns: 'wallet'
        })}
        onPress={handleAlertPress}
        testID="itwExpiringBannerTestID"
        variant="warning"
      />
      {bottomSheet.bottomSheet}
    </>
  );
};

type IssuerDynamicErrorAlertProps = {
  credential: StoredCredentialMetadata;
  message: Record<string, { description: string; title: string }>;
};

const IssuerDynamicErrorAlert = ({
  credential,
  message
}: IssuerDynamicErrorAlertProps) => {
  const localizedMessage = getLocalizedMessageOrFallback(message);
  const showCta =
    credential.credentialType === wellKnownCredential.DRIVING_LICENSE;

  const { confirmAndRemoveCredential } =
    useItwRemoveCredentialWithConfirm(credential);

  const bottomSheet = useIOBottomSheetModal({
    closeAccessibilityLabel: I18n.t('buttons.close', { ns: 'common' }),
    component: (
      <VStack space={24}>
        <IOMarkdown content={localizedMessage.description} />
        {showCta && (
          <View style={{ marginBottom: 16 }}>
            <IOButton
              fullWidth
              label={I18n.t('presentation.alerts.mdl.invalid.cta', {
                ns: 'wallet'
              })}
              onPress={confirmAndRemoveCredential}
              variant="solid"
            />
          </View>
        )}
      </VStack>
    ),
    title: localizedMessage.title
  });

  const handleAlertPress = useAlertPressHandler(bottomSheet);

  return (
    <>
      <Alert
        action={I18n.t('presentation.alerts.statusAction', { ns: 'wallet' })}
        content={localizedMessage.title}
        onPress={handleAlertPress}
        variant="error"
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
        description: I18n.t('credentials.status.unknown', { ns: 'wallet' }),
        title: I18n.t('credentials.status.unknown', { ns: 'wallet' })
      })
    : {
        description: I18n.t('credentials.status.unknown', { ns: 'wallet' }),
        title: I18n.t('credentials.status.unknown', { ns: 'wallet' })
      };

const Memoized = memo(ItwPresentationCredentialStatusAlert);

export { Memoized as ItwPresentationCredentialStatusAlert };
