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
import { ItwCredentialStatus } from '../../../types';
import {
  getCredentialNameFromType,
  useBorderColorByStatus,
  useTagPropsByStatus,
  validCredentialStatuses
} from '../../../utils/itwCredentialUtils';
import { getCredentialCapabilities } from '../../../utils/itwCredentialCapabilities';
import { CardBackground } from './CardBackground';
import { useAppSelector } from '../../../store';
import { selectFontPreference } from '@io-eudiw-app/preferences';
import { useCredentialCardConfig } from './config';
import { ItWalletIdLogo } from '../../ItWalletIdLogo';
import { wellKnownCredential } from '../../../utils/credentials';

export type ItwCredentialCardProps = {
  /**
   * Type of the credential, which is used to determine the
   * visual representation and styling of the card.
   */
  credentialType: string;
  /**
   * Current status of the credential, used to determine the
   * visual representation and the status tag to display.
   */
  credentialStatus?: ItwCredentialStatus;
};

export const ItwCredentialCard = memo(
  ({ credentialType, credentialStatus = 'valid' }: ItwCredentialCardProps) => {
    const typefacePreference = useAppSelector(selectFontPreference);
    const { themeType, theme } = useIOThemeContext();
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
                  <ItWalletIdLogo width={117} height={27} />
                </View>
              ) : (
                <IOText
                  size={16}
                  lineHeight={24}
                  font={
                    typefacePreference === 'comfortable'
                      ? 'Titillio'
                      : 'TitilliumSansPro'
                  }
                  weight="Semibold"
                  maxFontSizeMultiplier={1.25}
                  style={{
                    letterSpacing: 0.25,
                    color: cardConfig.titleColor,
                    flex: 1,
                    flexShrink: 1
                  }}
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
  cardWrapper: {
    aspectRatio: 16 / 10,
    borderRadius: 8
  },
  cardContainer: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden'
  },
  border: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 8,
    borderCurve: 'continuous',
    borderWidth: 1,
    zIndex: 11
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12
  },
  statusTag: {
    position: 'absolute',
    right: 16,
    top: 10,
    zIndex: 20
  },
  statusOverlay: {
    opacity: 0.7
  }
});
