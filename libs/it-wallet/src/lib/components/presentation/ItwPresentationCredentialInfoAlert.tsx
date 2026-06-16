import { Alert } from '@pagopa/io-app-design-system';
import { t } from 'i18next';
import { memo } from 'react';
import { CredentialInfoAlert } from '../../utils/itwCredentialCapabilities';
import {
  ItwCredentialStatus,
  StoredCredential
} from '../../utils/itwTypesUtils';
import { useAppSelector } from '../../store';
import { itwCredentialStatusSelector } from '../../store/selectors/wallet';

type Props = {
  credential: StoredCredential;
  infoAlert?: CredentialInfoAlert;
};

const validStates: Array<ItwCredentialStatus | undefined> = [
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
        testID={infoAlert.testID}
        content={t(infoAlert.contentI18nKey, { ns: 'wallet' })}
        variant="info"
      />
    );
  }

  return null;
};

const Memoized = memo(ItwPresentationCredentialInfoAlert);

export { Memoized as ItwPresentationCredentialInfoAlert };
