import { selectFontPreference } from '@io-eudiw-app/preferences';
import {
  HStack,
  IOColors,
  IOText,
  Tag,
  useIOThemeContext
} from '@pagopa/io-app-design-system';
import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useItwDisplayCredentialStatus } from '../../../hooks/useItwDisplayCredentialStatus';
import { useAppSelector } from '../../../store';
import { ItwCredentialStatus } from '../../../types';
import { wellKnownCredential } from '../../../utils/credentials';
import { getCredentialCapabilities } from '../../../utils/itwCredentialCapabilities';
import {
  getCredentialNameFromType,
  useBorderColorByStatus,
  useTagPropsByStatus,
  validCredentialStatuses
} from '../../../utils/itwCredentialUtils';
import { ItWalletIdLogo } from '../../ItWalletIdLogo';
import { CardBackground } from './CardBackground';
import { useCredentialCardConfig } from './config';

export type ItwCredentialCardProps = {
  /**
   * Current status of the credential, used to determine the
   * visual representation and the status tag to display.
   */
  credentialStatus?: ItwCredentialStatus;
  /**
   * Type of the credential, which is used to determine the
   * visual representation and styling of the card.
   */
  credentialType: string;
};

export const ItwCredentialCard = memo(
  ({ credentialStatus = 'valid', credentialType }: ItwCredentialCardProps) => {
    const typefacePreference = useAppSelector(selectFontPreference);
    const { theme, themeType } = useIOThemeContext();
    const status = useItwDisplayCredentialStatus(credentialStatus);
    const borderColorMap = useBorderColorByStatus(credentialType);
    const cardConfig = useCredentialCardConfig(credentialType);
    const tagPropsByStatus = useTagPropsByStatus();
    const isValid = validCredentialStatuses.includes(status);
    const capabilites = useMemo(
      () => getCredentialCapabilities(credentialType),
      [credentialType]
    );

    const statusTagProps = useMemo<Tag | undefined>(
      () => (capabilites.showStatusTag ? tagPropsByStatus[status] : undefined),
      [status, tagPropsByStatus, capabilites]
    );

    const appBackgroundColor = IOColors[theme['appBackground-primary']];

    return (
      <View
        style={[
          styles.cardWrapper,
          status === 'valid' && { boxShadow: `0 0 0 2px ${appBackgroundColor}` }
        ]}
      >
        <View style={styles.cardContainer}>
          <CardBackground {...cardConfig} />
          <View style={styles.header}>
            <HStack space={16}>
              {credentialType === wellKnownCredential.PID ? (
                <View style={{ flex: 1 }}>
                  <ItWalletIdLogo height={27} width={117} />
                </View>
              ) : (
                <IOText
                  font={
                    typefacePreference === 'comfortable'
                      ? 'Titillio'
                      : 'TitilliumSansPro'
                  }
                  lineHeight={24}
                  maxFontSizeMultiplier={1.25}
                  size={16}
                  style={{
                    color: cardConfig.titleColor,
                    flex: 1,
                    flexShrink: 1,
                    letterSpacing: 0.25
                  }}
                  weight="Semibold"
                >
                  {
                    /*
                    A selector that before using `getCredentialNameFromType` uses a wrapper that
                    first checks for Credential Catalogue metadata is present in ITW and has not
                    been ported because such Catalog is not present in the DWallet ecosystem
                  */
                    getCredentialNameFromType(credentialType).toUpperCase()
                  }
                </IOText>
              )}
            </HStack>
            {statusTagProps && (
              <View style={styles.statusTag}>
                <Tag {...statusTagProps} />
              </View>
            )}
          </View>

          {!isValid && (
            <View
              style={[
                StyleSheet.absoluteFill,
                styles.statusOverlay,
                {
                  backgroundColor:
                    themeType === 'light' ? IOColors.white : IOColors.black
                }
              ]}
            />
          )}
          <View
            style={[
              styles.border,
              status === 'valid' || capabilites.suppressStatusAlert
                ? { borderColor: cardConfig.borderColor, borderWidth: 1 }
                : { borderColor: borderColorMap[status], borderWidth: 2 }
            ]}
          />
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  border: {
    borderCurve: 'continuous',
    borderRadius: 8,
    borderWidth: 1,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 11
  },
  cardContainer: {
    borderRadius: 8,
    flex: 1,
    overflow: 'hidden'
  },
  cardWrapper: {
    aspectRatio: 16 / 10,
    borderRadius: 8
  },
  header: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12
  },
  statusOverlay: {
    opacity: 0.7
  },
  statusTag: {
    position: 'absolute',
    right: 16,
    top: 10,
    zIndex: 20
  }
});
