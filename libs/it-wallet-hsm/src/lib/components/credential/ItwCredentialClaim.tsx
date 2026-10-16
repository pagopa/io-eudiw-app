import { ListItemInfo } from '@pagopa/io-app-design-system';
import { Image } from 'react-native';

import { ParsedClaimsRecord } from '../../utils/claims';

/**
 * Renders a claim: images are displayed as such, everything else as plain text.
 * Empty claims are hidden.
 */
export const ItwCredentialClaim = ({
  claim
}: {
  claim: ParsedClaimsRecord[string];
}) => {
  const { label, parsed } = claim;

  if (parsed?.type === 'image') {
    return (
      <ListItemInfo
        accessibilityLabel={label}
        accessibilityRole="image"
        label={label}
        value={
          <Image
            accessibilityIgnoresInvertColors
            resizeMode="contain"
            source={{ uri: parsed.value }}
            style={{
              height: Math.ceil((200 * parsed.height) / parsed.width),
              width: 200
            }}
          />
        }
      />
    );
  }

  const value = parsed?.value ?? '';

  if (!value) {
    return null;
  } else {
    return (
      <ListItemInfo
        accessibilityLabel={`${label} ${value}`}
        label={label}
        numberOfLines={Number.MAX_SAFE_INTEGER}
        value={value}
      />
    );
  }
};
