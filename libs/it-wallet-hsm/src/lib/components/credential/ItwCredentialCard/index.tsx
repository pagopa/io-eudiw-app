import {
  HStack,
  IOColors,
  IOText,
  Tag,
  useIOTheme,
  useIOThemeContext
} from '@pagopa/io-app-design-system';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ItwCredentialStatus } from '../../../types';
import {
  getCredentialNameFromType,
  useBorderColorByStatus,
  useTagPropsByStatus,
  validCredentialStatuses
} from '../../../utils/itwCredentialUtils';

export type ItwCredentialCardProps = {
  /**
   * Current status of the credential, used to determine the
   * visual representation and the status tag to display.
   */
  credentialStatus?: ItwCredentialStatus;
  /**
   * Type of the credential. The card is rendered with a single, generic
   * style regardless of this value: it is only used as the title text and
   * to determine the status-related visuals.
   */
  credentialType: string;
};

export const ItwCredentialCard = memo(
  ({ credentialStatus = 'valid', credentialType }: ItwCredentialCardProps) => {
    const { theme, themeType } = useIOThemeContext();
    const ioTheme = useIOTheme();
    const status = credentialStatus;
    const borderColorMap = useBorderColorByStatus();
    const tagPropsByStatus = useTagPropsByStatus();
    const isValid = validCredentialStatuses.includes(status);
    const statusTagProps: Tag | undefined = tagPropsByStatus[status];

    const appBackgroundColor = IOColors[theme['appBackground-primary']];

    return (
      <View
        style={[
          styles.cardWrapper,
          status === 'valid' && { boxShadow: `0 0 0 2px ${appBackgroundColor}` }
        ]}
      >
        <View style={styles.cardContainer}>
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: IOColors[ioTheme['appBackground-secondary']] }
            ]}
          />
          <View style={styles.header}>
            <HStack space={16}>
              <IOText
                font="TitilliumSansPro"
                lineHeight={24}
                maxFontSizeMultiplier={1.25}
                size={16}
                style={{
                  color: IOColors[ioTheme['textBody-default']],
                  flex: 1,
                  flexShrink: 1,
                  letterSpacing: 0.25
                }}
                weight="Semibold"
              >
                {/* Generic, blank card: no per-credential name lookup, just the raw credential type/vct */}
                {getCredentialNameFromType(credentialType).toUpperCase()}
              </IOText>
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
              status === 'valid'
                ? { borderColor: IOColors['grey-300'], borderWidth: 1 }
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
