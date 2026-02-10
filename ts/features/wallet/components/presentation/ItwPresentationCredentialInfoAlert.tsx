import { Alert } from '@pagopa/io-app-design-system';
import { t } from 'i18next';
import { memo } from 'react';
import { useAppSelector } from '../../../../store';
import { itwCredentialStatusSelector } from '../../store/selectors/wallet';
import { wellKnownCredential } from '../../utils/credentials';
import {
  ItwCredentialStatus,
  StoredCredential
} from '../../utils/itwTypesUtils';

type Props = {
  credential: StoredCredential;
};

const validStates: Array<ItwCredentialStatus | undefined> = [
  'valid',
  'expiring',
  'jwtExpiring'
];

/**
 * Informative alert that is only visible when a credential is in a valid state.
 */
const ItwPresentationCredentialInfoAlert = ({ credential }: Props) => {
  const { credentialType } = credential;
  const { status } = useAppSelector(state =>
    itwCredentialStatusSelector(state, credential.credentialType)
  );

  if (!validStates.includes(status)) {
    return null;
  }

  if (credentialType === wellKnownCredential.DRIVING_LICENSE) {
    return (
      <Alert
        testID="itwMdlBannerTestID"
        content={t('presentation.alerts.mdl.content', { ns: 'wallet' })}
        variant="info"
      />
    );
  }

  if (credentialType === wellKnownCredential.DISABILITY_CARD) {
    return (
      <Alert
        testID="itwMdlBannerTestID"
        content={t('presentation.alerts.edc.content', { ns: 'wallet' })}
        variant="info"
      />
    );
  }

  return null;
};

const Memoized = memo(ItwPresentationCredentialInfoAlert);

export { Memoized as ItwPresentationCredentialInfoAlert };
