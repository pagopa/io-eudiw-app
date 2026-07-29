import { ListItemAction } from '@pagopa/io-app-design-system';
import { t } from 'i18next';
import { memo } from 'react';
import { View } from 'react-native';

import { useItwRemoveCredentialWithConfirm } from '../../hooks/useItwRemoveCredentialWithConfirm';
import { useNotAvailableToastGuard } from '../../hooks/useNotAvailableToastGuard';
import { useAppSelector } from '../../store';
import { ItwCredentialCapabilities } from '../../utils/itwCredentialCapabilities';
import { StoredCredentialMetadata } from '../../utils/itwTypesUtils';

type ItwPresentationDetailFooterProps = {
  capabilities: ItwCredentialCapabilities;
  credential: StoredCredentialMetadata;
};

const ItwPresentationDetailsFooter = ({
  capabilities,
  credential
}: ItwPresentationDetailFooterProps) => {
  const { confirmAndRemoveCredential } =
    useItwRemoveCredentialWithConfirm(credential);

  return (
    <View>
      {capabilities
        .getExtraCredentialActions?.(useAppSelector)
        .map(({ key, props }) => (
          <ListItemAction key={key} {...props} />
        ))}
      <ListItemAction
        accessibilityLabel={t(
          'presentation.credentialDetails.actions.requestAssistance',
          {
            ns: 'wallet'
          }
        )}
        icon="message"
        label={t('presentation.credentialDetails.actions.requestAssistance', {
          ns: 'wallet'
        })}
        onPress={useNotAvailableToastGuard()}
        testID="requestAssistanceActionTestID"
        variant="primary"
      />
      <ListItemAction
        accessibilityLabel={t(
          'presentation.credentialDetails.actions.removeFromWallet',
          {
            ns: 'wallet'
          }
        )}
        icon="trashcan"
        label={t('presentation.credentialDetails.actions.removeFromWallet', {
          ns: 'wallet'
        })}
        onPress={confirmAndRemoveCredential}
        testID="removeCredentialActionTestID"
        variant="danger"
      />
    </View>
  );
};

const MemoizedItwPresentationDetailsFooter = memo(ItwPresentationDetailsFooter);

export { MemoizedItwPresentationDetailsFooter as ItwPresentationDetailsFooter };
