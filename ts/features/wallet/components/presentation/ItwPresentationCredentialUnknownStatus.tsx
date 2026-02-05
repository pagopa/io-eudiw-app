import { useNavigation } from '@react-navigation/native';
import I18n from 'i18next';
import { OperationResultScreenContent } from '../../../../components/screens/OperationResultScreenContent';
import { useHeaderSecondLevel } from '../../../../hooks/useHeaderSecondLevel';
import { getCredentialNameFromType } from '../../utils/itwCredentialUtils';
import { StoredCredential } from '../../utils/itwTypesUtils';

type Props = {
  credential: StoredCredential;
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
    title: '',
    headerShown: false
  });

  return (
    <OperationResultScreenContent
      pictogram="updateOS"
      title={I18n.t('presentation.statusAssertionUnknown.title', {
        ns: 'wallet',
        credentialName
      })}
      subtitle={I18n.t('presentation.statusAssertionUnknown.content', {
        ns: 'wallet'
      })}
      action={{
        label: I18n.t('presentation.statusAssertionUnknown.primaryAction', {
          ns: 'wallet'
        }),
        onPress: () => navigation.goBack()
      }}
    />
  );
};
