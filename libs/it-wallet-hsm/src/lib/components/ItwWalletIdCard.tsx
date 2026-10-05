import { useAppSelector } from '../store';
import { itwCredentialsPidStatusSelector } from '../store/credentials';
import { wellKnownCredential } from '../utils/credentials';
import { ItwCredentialWalletCard } from './credential/ItwCredentialWalletCard';

export const ItwWalletIdCard = ({ isStacked }: { isStacked: boolean }) => {
  const pidStatus = useAppSelector(itwCredentialsPidStatusSelector);

  return (
    <ItwCredentialWalletCard
      cardProps={{
        credentialStatus: pidStatus,
        credentialType: wellKnownCredential.PID
      }}
      isStacked={isStacked}
    />
  );
};
