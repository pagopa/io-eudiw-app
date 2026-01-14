import { memo } from 'react';
import { Alert } from '@pagopa/io-app-design-system';
import I18n from 'i18next';
import { useAppSelector } from '../../../../store';
import { StoredCredential } from '../../utils/types';
import { ItwCredentialStatus } from '../../utils/itwTypesUtils';
import { CredentialType } from '../../utils/itwMocksUtils';
import { itwCredentialStatusSelector } from '../../store/selectors/wallet';

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

  if (credentialType === CredentialType.DRIVING_LICENSE) {
    return (
      <Alert
        testID="itwMdlBannerTestID"
        content={I18n.t('presentation.alerts.mdl.content', { ns: 'wallet' })}
        variant="info"
      />
    );
  }

  return null;
};

const Memoized = memo(ItwPresentationCredentialInfoAlert);

export { Memoized as ItwPresentationCredentialInfoAlert };
