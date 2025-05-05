import React, {useMemo, memo} from 'react';
import {Badge, IOIcons, ModuleCredential} from '@pagopa/io-app-design-system';
import i18next from 'i18next';
import {
  wellKnownCredential,
  getCredentialNameByType
} from '../../utils/credentials';

type Props = {
  type: string;
  onPress: (type: string) => void;
  isSaved: boolean;
  isFetching: boolean;
};

const credentialIconByType: Record<string, IOIcons> = {
  [wellKnownCredential.DRIVING_LICENSE]: 'car',
  [wellKnownCredential.PID]: 'fingerprint',
  [wellKnownCredential.HEALTHID]: 'healthCard'
};

const activeBadge: Badge = {
  variant: 'success',
  text: i18next.t('credentialIssuance.badges.saved', {ns: 'wallet'})
};

/**
 * Module credential component which represent a credential in the credential list when requiring a new credential.
 * @param type - the type of the credential
 * @param onPress - the callback to be called when the credential is pressed
 * @param isSaved - if true, the credential has already been obtained
 * @param isFetching - if true, the credential issuance flow has been started
 */
const OnboardingModuleCredential = ({
  type,
  onPress,
  isSaved,
  isFetching
}: Props) => {
  const badge = useMemo((): Badge | undefined => {
    if (isSaved) {
      return activeBadge;
    }
    return undefined;
  }, [isSaved]);

  const handleOnPress = () => {
    onPress(type);
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
export {MemoizedComponent as OnboardingModuleCredential};
