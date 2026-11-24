import type { ImageURISource } from 'react-native';

import { Avatar, HStack, Icon, useIOTheme } from '@pagopa/io-app-design-system';
import { memo } from 'react';

type Props = {
  requesterLogoUri?: ImageURISource | undefined;
};

/**
 * Render icons that display the interaction between the wallet
 * and a requester when exchanging user data.
 */
export const ItwDataExchangeIcons = memo(({ requesterLogoUri }: Props) => {
  const theme = useIOTheme();

  return (
    <HStack space={8} style={{ alignItems: 'center' }}>
      {requesterLogoUri ? (
        <Avatar logoUri={requesterLogoUri} size="small" />
      ) : (
        <Icon color={theme['icon-default']} name="institution" size={24} />
      )}
      <Icon color={theme['icon-default']} name="transactions" size={24} />
      <Avatar
        logoUri={require('../../assets/img/brand/app-logo-inverted.png')}
        size="small"
      />
    </HStack>
  );
});
