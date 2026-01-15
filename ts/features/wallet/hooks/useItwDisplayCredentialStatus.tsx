import { useAppSelector } from '../../../store';
import { itwCredentialsPidStatusSelector } from '../store/credentials';
import { ItwCredentialStatus } from '../types';
import { getItwDisplayCredentialStatus } from '../utils/credentials';

/**
 * Computes the display status of a credential for UI purposes
 * by combining store selectors (pid status and offline state)
 * with the pure logic from getItwDisplayCredentialStatus.
 *
 * This hook does not reflect the credential’s real status — it adapts
 * the status shown in the Wallet or credential details screen.
 *
 * @param credentialStatus the actual status of the credential
 * @returns {ItwCredentialStatus} The status to display in the UI
 */
export const useItwDisplayCredentialStatus = (
  credentialStatus: ItwCredentialStatus
): ItwCredentialStatus => {
  const pidStatus = useAppSelector(itwCredentialsPidStatusSelector);

  return getItwDisplayCredentialStatus(credentialStatus, pidStatus);
};
