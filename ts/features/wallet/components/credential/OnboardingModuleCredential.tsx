import { Badge, IOIcons, ModuleCredential } from '@pagopa/io-app-design-system';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getCredentialNameByType,
  wellKnownCredential
} from '../../utils/credentials';

type Props = {
  type: string;
  configId: string;
  onPress: (type: string) => void;
  isSaved: boolean;
  isFetching: boolean;
};

const credentialIconByType: Record<string, IOIcons> = {
  [wellKnownCredential.DRIVING_LICENSE]: 'car',
  [wellKnownCredential.PID]: 'fingerprint',
  [wellKnownCredential.HEALTHID]: 'healthCard',
  [wellKnownCredential.DISABILITY_CARD]: 'accessibility'
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
  type,
  configId,
  onPress,
  isSaved,
  isFetching
}: Props) => {
  const { t } = useTranslation('wallet');
  const badge = useMemo((): Badge | undefined => {
    if (isSaved) {
      return {
        variant: 'success',
        text: t('credentialIssuance.badges.saved', { ns: 'wallet' })
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
      testID={`${type}ModuleTestID`}
      icon={credentialIconByType[type]}
      label={getCredentialNameByType(type)}
      onPress={isPressable ? handleOnPress : undefined}
      isFetching={isFetching}
      badge={badge}
    />
  );
};

const MemoizedComponent = memo(OnboardingModuleCredential);
export { MemoizedComponent as OnboardingModuleCredential };
