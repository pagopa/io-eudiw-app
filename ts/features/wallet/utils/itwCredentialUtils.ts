import { IOColors, Tag, useIOTheme } from '@pagopa/io-app-design-system';
import { Mdoc, SdJwt } from '@pagopa/io-react-native-wallet';
import { Verification } from '@pagopa/io-react-native-wallet/lib/typescript/sd-jwt/types';
import { t } from 'i18next';
import { wellKnownCredential } from './credentials';
import {
  CredentialFormat,
  ItwCredentialStatus,
  StoredCredential
} from './itwTypesUtils';

export const useBorderColorByStatus: () => {
  [key in ItwCredentialStatus]: string;
} = () => {
  const theme = useIOTheme();

  return {
    valid: IOColors[theme['appBackground-primary']],
    invalid: IOColors['error-600'],
    expired: IOColors['error-600'],
    expiring: IOColors['warning-700'],
    jwtExpired: IOColors['error-600'],
    jwtExpiring: IOColors['warning-700'],
    unknown: IOColors['grey-300']
  };
};

export const tagPropsByStatus: { [key in ItwCredentialStatus]?: Tag } = {
  invalid: {
    variant: 'error',
    text: t('credentials.status.invalid', { ns: 'wallet' })
  },
  expired: {
    variant: 'error',
    text: t('credentials.status.expired', { ns: 'wallet' })
  },
  jwtExpired: {
    variant: 'error',
    text: t('credentials.status.verificationExpired', { ns: 'wallet' })
  },
  expiring: {
    variant: 'warning',
    text: t('credentials.status.expiring', { ns: 'wallet' })
  },
  jwtExpiring: {
    variant: 'warning',
    text: t('credentials.status.verificationExpiring', { ns: 'wallet' })
  },
  unknown: {
    variant: 'custom',
    icon: { name: 'infoFilled', color: 'grey-450' },
    text: t('credentials.status.unknown', { ns: 'wallet' })
  }
};

/**
 * List of statuses that make a credential valid, especially for UI purposes.
 */
export const validCredentialStatuses: Array<ItwCredentialStatus> = [
  'valid',
  'expiring',
  'jwtExpiring'
];

const itwGetCredentialNameByCredentialType = (): Record<string, string> => ({
  [wellKnownCredential.DISABILITY_CARD]: t('credentials.names.disabilityCard', {
    ns: 'wallet'
  }),
  [wellKnownCredential.DRIVING_LICENSE]: t('credentials.names.mdl', {
    ns: 'wallet'
  }),
  [wellKnownCredential.PID]: t('credentials.names.pid', {
    ns: 'wallet'
  })
});

export const getCredentialNameFromType = (
  credentialType: string | undefined,
  withDefault: string = ''
): string =>
  credentialType !== undefined
    ? itwGetCredentialNameByCredentialType()[credentialType]
    : withDefault;

/**
 * Extracts the verification claim from the SD-JWT,
 * checks whether the `assurance_level` field is equal to `"high"` or the
 * Extracts the verification object from a stored credential based on its format.
 * @param credential - The stored credential fields needed to extract verification
 * @returns The verification object or undefined if extraction fails
 */
export const extractVerification = ({
  format,
  credential,
  parsedCredential
}: Pick<StoredCredential, 'format' | 'credential' | 'parsedCredential'>):
  | Verification
  | undefined => {
  try {
    switch (format) {
      case CredentialFormat.SD_JWT:
        return SdJwt.getVerification(credential);
      case CredentialFormat.MDOC:
        return Mdoc.getVerificationFromParsedCredential(parsedCredential);
      default:
        return undefined;
    }
  } catch {
    return undefined;
  }
};

/**
 * Checks whether the `assurance_level` field is equal to `"high"` or the
 * `trust_framework` field is equal to `"it_l2+document_proof"`,
 * and returns `true` only if one of these conditions is met.
 *
 * `"it_l2+document_proof"` indicates that the credential has been issued with
 * a substantial authentication (SPID, CieID) plus an MRTD PoP verification,
 *
 * @param storedCredential - The stored credential to check
 * @returns boolean indicating if the credential is an ITW credential (L3)
 */
export const isItwCredential = (
  storedCredential: StoredCredential
): boolean => {
  const verification = storedCredential.verification;
  return (
    verification?.assurance_level === 'high' ||
    verification?.trust_framework === 'it_l2+document_proof'
  );
};
