import { ListItemAction } from '@pagopa/io-app-design-system';
import I18n from 'i18next';
import { memo } from 'react';
import { View } from 'react-native';
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
        label={I18n.t(
          'presentation.credentialDetails.actions.requestAssistance',
          {
            ns: 'wallet'
          }
        )}
        accessibilityLabel={I18n.t(
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
        label={I18n.t(
          'presentation.credentialDetails.actions.removeFromWallet',
          {
            ns: 'wallet'
          }
        )}
        accessibilityLabel={I18n.t(
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
