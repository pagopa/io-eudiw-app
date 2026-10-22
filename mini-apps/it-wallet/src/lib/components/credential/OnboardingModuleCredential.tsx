import { Badge, IOIcons, ModuleCredential } from '@pagopa/io-app-design-system';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  getCredentialNameByType,
  wellKnownCredential
} from '../../utils/credentials';

type Props = {
  configId: string;
  isFetching: boolean;
  isSaved: boolean;
  onPress: (type: string) => void;
  type: string;
};

const credentialIconByType: Record<string, IOIcons> = {
  [wellKnownCredential.BONUS_PARI]: 'bonus',
  [wellKnownCredential.DISABILITY_CARD]: 'accessibility',
  [wellKnownCredential.DRIVING_LICENSE]: 'car',
  [wellKnownCredential.PID]: 'fingerprint'
};

/**
 * Module credential component which represent a credential in the credential list when requiring a new credential.
 * @param type - the type of the credential
 * @param configId - the EC configuration ID of the credential
 * @param onPress - the callback to be called when the credential is pressed
 * @param isSaved - if true, the credential has already been obtained
 * @param isFetching - if true, the credential issuance flow has been started
 */
const OnboardingModuleCredential = ({
  configId,
  isFetching,
  isSaved,
  onPress,
  type
}: Props) => {
  const { t } = useTranslation('wallet');
  const badge = useMemo((): Badge | undefined => {
    if (isSaved) {
      return {
        text: t('credentialIssuance.badges.saved'),
        variant: 'success'
      };
    }
    return undefined;
  }, [isSaved, t]);

  const handleOnPress = () => {
    onPress(configId);
  };

  const isPressable = !isSaved;

  return (
    <ModuleCredential
      badge={badge}
      icon={credentialIconByType[type]}
      isFetching={isFetching}
      label={getCredentialNameByType(type)}
      onPress={isPressable ? handleOnPress : undefined}
      testID={`${type}ModuleTestID`}
    />
  );
};

const MemoizedComponent = memo(OnboardingModuleCredential);
export { MemoizedComponent as OnboardingModuleCredential };
