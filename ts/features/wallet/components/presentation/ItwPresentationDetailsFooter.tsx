import { ListItemAction } from '@pagopa/io-app-design-system';
import { memo } from 'react';
import { View } from 'react-native';
import { t } from 'i18next';
import { useItwRemoveCredentialWithConfirm } from '../../hooks/useItwRemoveCredentialWithConfirm';
import { useNotAvailableToastGuard } from '../../hooks/useNotAvailableToastGuard';
import { StoredCredential } from '../../utils/itwTypesUtils';

type ItwPresentationDetailFooterProps = {
  credential: StoredCredential;
};

const ItwPresentationDetailsFooter = ({
  credential
}: ItwPresentationDetailFooterProps) => {
  const { confirmAndRemoveCredential } =
    useItwRemoveCredentialWithConfirm(credential);

  return (
    <View>
      <ListItemAction
        testID="requestAssistanceActionTestID"
        variant="primary"
        icon="message"
        label={t('presentation.credentialDetails.actions.requestAssistance', {
          ns: 'wallet'
        })}
        accessibilityLabel={t(
          'presentation.credentialDetails.actions.requestAssistance',
          {
            ns: 'wallet'
          }
        )}
        onPress={useNotAvailableToastGuard()}
      />
      <ListItemAction
        testID="removeCredentialActionTestID"
        variant="danger"
        icon="trashcan"
        label={t('presentation.credentialDetails.actions.removeFromWallet', {
          ns: 'wallet'
        })}
        accessibilityLabel={t(
          'presentation.credentialDetails.actions.removeFromWallet',
          {
            ns: 'wallet'
          }
        )}
        onPress={confirmAndRemoveCredential}
      />
    </View>
  );
};

const MemoizedItwPresentationDetailsFooter = memo(ItwPresentationDetailsFooter);

export { MemoizedItwPresentationDetailsFooter as ItwPresentationDetailsFooter };
