import { ListItemAction } from '@pagopa/io-app-design-system';
import { t } from 'i18next';
import { memo } from 'react';
import { View } from 'react-native';
import { useItwRemoveCredentialWithConfirm } from '../../hooks/useItwRemoveCredentialWithConfirm';
import { useNotAvailableToastGuard } from '../../hooks/useNotAvailableToastGuard';
import { StoredCredentialMetadata } from '../../utils/itwTypesUtils';
import { ItwCredentialCapabilities } from '../../utils/itwCredentialCapabilities';
import { useAppSelector } from '../../store';

type ItwPresentationDetailFooterProps = {
  credential: StoredCredentialMetadata;
  capabilities: ItwCredentialCapabilities;
};

const ItwPresentationDetailsFooter = ({
  credential,
  capabilities
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
