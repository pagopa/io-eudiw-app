import { ModuleCredential } from '@pagopa/io-app-design-system';
import { memo } from 'react';

import { getCredentialNameByType } from '../../utils/credentials';

type Props = {
  configId: string;
  isFetching: boolean;
  onPress: (type: string) => void;
  type: string;
};

/**
 * Module credential component which represent a credential in the credential list when requiring a new credential.
 * @param type - the type of the credential
 * @param configId - the EC configuration ID of the credential
 * @param onPress - the callback to be called when the credential is pressed
 * @param isFetching - if true, the credential issuance flow has been started
 */
const OnboardingModuleCredential = ({
  configId,
  isFetching,
  onPress,
  type
}: Props) => (
  <ModuleCredential
    isFetching={isFetching}
    label={getCredentialNameByType(type)}
    onPress={() => onPress(configId)}
    testID={`${type}ModuleTestID`}
  />
);

const MemoizedComponent = memo(OnboardingModuleCredential);
export { MemoizedComponent as OnboardingModuleCredential };
