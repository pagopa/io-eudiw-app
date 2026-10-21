import { OperationResultScreenContent } from '@io-eudiw-app/commons';
import { useHeaderSecondLevel } from '@io-eudiw-app/commons';
import { useNavigation } from '@react-navigation/native';
import { t } from 'i18next';

import { getCredentialNameFromType } from '../../utils/itwCredentialUtils';
import { StoredCredentialMetadata } from '../../utils/itwTypesUtils';

type Props = {
  credential: StoredCredentialMetadata;
};

/**
 * Rendered when it is not possible to determine the status of a credential,
 * i.e. the API call to fetch the status assertion from the issuer failed.
 */
export const ItwPresentationCredentialUnknownStatus = ({
  credential
}: Props) => {
  const navigation = useNavigation();
  const credentialName = getCredentialNameFromType(credential.credentialType);

  useHeaderSecondLevel({
    headerShown: false,
    title: ''
  });

  return (
    <OperationResultScreenContent
      action={{
        label: t('presentation.statusAssertionUnknown.primaryAction', {
          ns: 'wallet'
        }),
        onPress: () => navigation.goBack()
      }}
      pictogram="updateOS"
      subtitle={t('presentation.statusAssertionUnknown.content', {
        ns: 'wallet'
      })}
      title={t('presentation.statusAssertionUnknown.title', {
        credentialName,
        ns: 'wallet'
      })}
    />
  );
};
