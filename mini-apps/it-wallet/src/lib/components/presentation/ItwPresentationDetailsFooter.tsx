import { ListItemAction } from '@pagopa/io-app-design-system';
import { t } from 'i18next';
import { memo } from 'react';
import { View } from 'react-native';

import { useItwRemoveCredentialWithConfirm } from '../../hooks/useItwRemoveCredentialWithConfirm';
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
  const { confirmAndRemoveCredential, isPid } =
    useItwRemoveCredentialWithConfirm(credential);

  const removeLabel = t(
    isPid
      ? 'presentation.credentialDetails.actions.deactivateItWallet'
      : 'presentation.credentialDetails.actions.removeFromWallet',
    { ns: 'wallet' }
  );

  return (
    <View>
      {capabilities
        .getExtraCredentialActions?.(useAppSelector)
        .map(({ key, props }) => (
          <ListItemAction key={key} {...props} />
        ))}
      <ListItemAction
        accessibilityLabel={removeLabel}
        icon="trashcan"
        label={removeLabel}
        onPress={confirmAndRemoveCredential}
        testID="removeCredentialActionTestID"
        variant="danger"
      />
    </View>
  );
};

const MemoizedItwPresentationDetailsFooter = memo(ItwPresentationDetailsFooter);

export { MemoizedItwPresentationDetailsFooter as ItwPresentationDetailsFooter };
