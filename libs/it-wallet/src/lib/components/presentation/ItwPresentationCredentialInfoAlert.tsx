import { Alert } from '@pagopa/io-app-design-system';
import { t } from 'i18next';
import { memo } from 'react';

import { useAppSelector } from '../../store';
import { itwCredentialStatusSelector } from '../../store/selectors/wallet';
import { CredentialInfoAlert } from '../../utils/itwCredentialCapabilities';
import {
  ItwCredentialStatus,
  StoredCredentialMetadata
} from '../../utils/itwTypesUtils';

type Props = {
  credential: StoredCredentialMetadata;
  infoAlert?: CredentialInfoAlert;
};

const validStates: (ItwCredentialStatus | undefined)[] = [
  'valid',
  'expiring',
  'jwtExpiring'
];

/**
 * Informative alert that is only visible when a credential is in a valid state.
 */
const ItwPresentationCredentialInfoAlert = ({
  credential,
  infoAlert
}: Props) => {
  const { status } = useAppSelector(state =>
    itwCredentialStatusSelector(state, credential.credentialType)
  );

  if (!validStates.includes(status)) {
    return null;
  }

  if (infoAlert) {
    return (
      <Alert
        content={t(infoAlert.contentI18nKey, { ns: 'wallet' })}
        testID={infoAlert.testID}
        variant="info"
      />
    );
  }

  return null;
};

const Memoized = memo(ItwPresentationCredentialInfoAlert);

export { Memoized as ItwPresentationCredentialInfoAlert };
