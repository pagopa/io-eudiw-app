import { HStack, Icon, IOText, Tag } from '@pagopa/io-app-design-system';
import Color from 'color';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { CardColorScheme, ItwCredentialStatus } from '../types';
import { useItwDisplayCredentialStatus } from '../hooks/useItwDisplayCredentialStatus';
import { useThemeColorByCredentialType } from '../utils/itwStyleUtils';
import {
  tagPropsByStatus,
  useBorderColorByStatus,
  validCredentialStatuses
} from '../utils/itwCredentialUtils';
import { getCredentialNameByType } from '../utils/credentials';
import { CardBackground } from './CardBackground';
import { DigitalVersionBadge } from './DigitalVersionBadge';

export type ItwCredentialCard = {
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
  /**
   * Used to determine if the card should be displayed with a
   * badge for the upgrade pending status.
   * If its false but the user has an L3 PID, the card will
   * be displayed with a badge.
   */
  isItwCredential?: boolean;
  /**
   * Indicates if the credential is a multi-level credential,
   * which affects the display of a specific badge on the card.
   */
  isMultiCredential?: boolean;
};

type StyleProps = {
  titleColor: string;
  titleOpacity: number;
  colorScheme: CardColorScheme;
};

export const ItwCredentialCard = ({
  credentialType,
  credentialStatus = 'valid',
  isMultiCredential
}: ItwCredentialCard) => {
  const status = useItwDisplayCredentialStatus(credentialStatus);
  const theme = useThemeColorByCredentialType(credentialType);
  const borderColorMap = useBorderColorByStatus();

  const statusTagProps = useMemo<Tag | undefined>(
    () => tagPropsByStatus[status],
    [status]
  );

  const { titleColor, titleOpacity, colorScheme } = useMemo<StyleProps>(() => {
    // Include "jwtExpired" as a valid status because credentials with this state
    // should not appear faded. Only the "expired" status should be displayed with reduced opacity.
    const isValid = [...validCredentialStatuses, 'jwtExpired'].includes(status);

    if (status === 'unknown') {
      return {
        titleColor: Color(theme.textColor).grayscale().hex(),
        titleOpacity: 0.5,
        colorScheme: 'greyscale'
      };
    }

    if (isValid) {
      return {
        titleColor: theme.textColor,
        titleOpacity: 1,
        colorScheme: 'default'
      };
    }

    return {
      titleColor: theme.textColor,
      titleOpacity: 0.5,
      colorScheme: 'faded'
    };
  }, [theme, status]);

  return (
    <View style={styles.cardContainer}>
      <CardBackground
        credentialType={credentialType}
        colorScheme={colorScheme}
      />
      <View style={styles.header}>
        <HStack space={16}>
          <IOText
            size={16}
            lineHeight={20}
            font={
              'TitilliumSansPro' /* TODO: Check if preferences are needed */
            }
            weight="Semibold"
            maxFontSizeMultiplier={1.25}
            style={{
              letterSpacing: 0.25,
              color: titleColor,
              opacity: titleOpacity,
              flex: 1,
              flexShrink: 1
            }}
          >
            {getCredentialNameByType(credentialType).toUpperCase()}
          </IOText>
          {statusTagProps && <Tag forceLightMode {...statusTagProps} />}
          {isMultiCredential && (
            <Icon name="multiCard" color="grey-850" size={24} />
          )}
        </HStack>
      </View>
      <DigitalVersionBadge
        credentialType={credentialType}
        colorScheme={colorScheme}
      />
      <View style={[styles.border, { borderColor: borderColorMap[status] }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    aspectRatio: 16 / 10,
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
    borderWidth: 2,
    zIndex: 11
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14
  }
});
