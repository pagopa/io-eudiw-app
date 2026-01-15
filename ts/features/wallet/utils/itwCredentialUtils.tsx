import { IOColors, Tag, useIOTheme } from '@pagopa/io-app-design-system';
import { SdJwt, Mdoc } from '@pagopa/io-react-native-wallet';
import I18n from 'i18next';
import { wellKnownCredentialConfigurationIDs } from './credentials';
import { CredentialFormat, ItwCredentialStatus } from './itwTypesUtils';
import { StoredCredential } from './types';

export const availableCredentials = [
  wellKnownCredentialConfigurationIDs.DRIVING_LICENSE,
  wellKnownCredentialConfigurationIDs.DISABILITY_CARD,
  wellKnownCredentialConfigurationIDs.HEALTHID
] as const;

// *This part is commented out because these credentials are not yet available
// export const newCredentials = [
//   wellKnownCredentialConfigurationIDs.EDUCATION_DEGREE,
//   wellKnownCredentialConfigurationIDs.EDUCATION_ENROLLMENT,
//   wellKnownCredentialConfigurationIDs.RESIDENCY
// ] as const;
// export type NewCredential = (typeof newCredentials)[number];

export const upcomingCredentials = [] as ReadonlyArray<string>;

export const isUpcomingCredential = (type: string): boolean =>
  upcomingCredentials.includes(type);

// *This part is commented out because these credentials are not yet available
// export const isNewCredential = (type: string): type is NewCredential =>
//   newCredentials.includes(type as NewCredential);

export const itwGetCredentialNameByCredentialType = (
  isItwCredential: boolean
): Record<string, string> => ({
  [wellKnownCredentialConfigurationIDs.DISABILITY_CARD]: I18n.t(
    'features.itWallet.credentialName.dc'
  ),
  [wellKnownCredentialConfigurationIDs.HEALTHID]: I18n.t(
    'features.itWallet.credentialName.ts'
  ),
  [wellKnownCredentialConfigurationIDs.DRIVING_LICENSE]: I18n.t(
    'features.itWallet.credentialName.mdl'
  ),
  [wellKnownCredentialConfigurationIDs.PID]: I18n.t(
    isItwCredential
      ? 'features.itWallet.credentialName.pid'
      : 'features.itWallet.credentialName.eid'
  )

  // *This part is commented out because these credentials are not yet available
  // [CredentialType.EDUCATION_DEGREE]: I18n.t(
  //   'features.itWallet.credentialName.ed'
  // ),
  // [CredentialType.EDUCATION_ENROLLMENT]: I18n.t(
  //   'features.itWallet.credentialName.ee'
  // ),
  // [CredentialType.RESIDENCY]: I18n.t('features.itWallet.credentialName.res')
});

export const getCredentialNameFromType = (
  credentialType: string | undefined,
  withDefault: string = '',
  isItwCredential: boolean = false
): string => {
  if (!credentialType) {
    return withDefault;
  }
  return (
    itwGetCredentialNameByCredentialType(isItwCredential)[credentialType] ??
    withDefault
  );
};

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
    text: I18n.t('features.itWallet.card.status.invalid')
  },
  expired: {
    variant: 'error',
    text: I18n.t('features.itWallet.card.status.expired')
  },
  jwtExpired: {
    variant: 'error',
    text: I18n.t('features.itWallet.card.status.verificationExpired')
  },
  expiring: {
    variant: 'warning',
    text: I18n.t('features.itWallet.card.status.expiring')
  },
  jwtExpiring: {
    variant: 'warning',
    text: I18n.t('features.itWallet.card.status.verificationExpiring')
  },
  unknown: {
    variant: 'custom',
    icon: { name: 'infoFilled', color: 'grey-450' },
    text: I18n.t('features.itWallet.card.status.unknown')
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

export const isItwCredential = ({
  format,
  credential,
  parsedCredential
}: StoredCredential): boolean => {
  try {
    // eslint-disable-next-line functional/no-let
    let verification: any = null;

    switch (format) {
      case CredentialFormat.SD_JWT:
        verification = SdJwt.getVerification(credential);
        break;
      case CredentialFormat.MDOC:
        verification =
          Mdoc.getVerificationFromParsedCredential(parsedCredential);
        break;
      case CredentialFormat.LEGACY_SD_JWT:
      default:
        verification = null;
    }

    if (!verification) {
      return false;
    }

    const { assurance_level, trust_framework } = verification;
    return (
      assurance_level === 'high' || trust_framework === 'it_l2+document_proof'
    );
  } catch (e) {
    return false;
  }
};
