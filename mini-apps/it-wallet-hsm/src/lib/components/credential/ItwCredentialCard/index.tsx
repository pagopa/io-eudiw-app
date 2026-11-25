import { selectFontPreference } from '@io-eudiw-app/preferences';
import {
  HStack,
  IOColors,
  IOText,
  Tag,
  useIOThemeContext
} from '@pagopa/io-app-design-system';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import CertifiedEudiWalletLogo from '../../../../assets/img/brand/certified_eudi_wallet.svg';
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
import { BrandedBorder } from './BrandedBorder';
import { CardBackground } from './CardBackground';
import { useCredentialCardConfig } from './config';
import { ValidInBadge } from './ValidInBadge';

const CARD_BORDER_RADIUS = 8;

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
    const { t } = useTranslation('hsm');
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
    const isPid = credentialType === wellKnownCredential.PID;

    return (
      <View
        style={[
          styles.cardWrapper,
          isPid && styles.pidCardWrapper,
          status === 'valid' && { boxShadow: `0 0 0 2px ${appBackgroundColor}` }
        ]}
      >
        <View style={styles.cardContainer}>
          <CardBackground {...cardConfig} />
          <View style={styles.header}>
            <HStack space={16}>
              <IOText
                font={
                  typefacePreference === 'comfortable'
                    ? 'Titillio'
                    : 'TitilliumSansPro'
                }
                lineHeight={isPid ? 28 : 24}
                maxFontSizeMultiplier={1.25}
                size={isPid ? 20 : 16}
                style={{
                  color: cardConfig.titleColor,
                  flex: 1,
                  flexShrink: 1,
                  letterSpacing: 0.25
                }}
                weight="Semibold"
              >
                {isPid
                  ? t('presentation.credentialDetails.pidTitle')
                  : /*
                    A selector that before using `getCredentialNameFromType` uses a wrapper that
                    first checks for Credential Catalogue metadata is present in ITW and has not
                    been ported because such Catalog is not present in the DWallet ecosystem
                  */
                    getCredentialNameFromType(credentialType).toUpperCase()}
              </IOText>
            </HStack>
            {statusTagProps ? (
              <View style={styles.statusTag}>
                <Tag {...statusTagProps} />
              </View>
            ) : (
              isPid && <ValidInBadge />
            )}
          </View>
          {isPid && (
            <View style={styles.certifiedLogo}>
              <CertifiedEudiWalletLogo
                accessibilityLabel="Certified EUDI Wallet"
                height={24}
                width={93}
              />
            </View>
          )}

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
          {isPid && status === 'valid' ? (
            <BrandedBorder cornerRadius={CARD_BORDER_RADIUS} />
          ) : (
            <View
              style={[
                styles.border,
                status === 'valid' || capabilites.suppressStatusAlert
                  ? { borderColor: cardConfig.borderColor, borderWidth: 1 }
                  : { borderColor: borderColorMap[status], borderWidth: 2 }
              ]}
            />
          )}
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  border: {
    borderCurve: 'continuous',
    borderRadius: CARD_BORDER_RADIUS,
    borderWidth: 1,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 11
  },
  cardContainer: {
    borderRadius: CARD_BORDER_RADIUS,
    flex: 1,
    overflow: 'hidden'
  },
  cardWrapper: {
    aspectRatio: 16 / 10,
    borderRadius: CARD_BORDER_RADIUS
  },
  certifiedLogo: {
    bottom: 16,
    position: 'absolute',
    right: 16
  },
  header: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12
  },
  pidCardWrapper: {
    aspectRatio: 324 / 126
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
