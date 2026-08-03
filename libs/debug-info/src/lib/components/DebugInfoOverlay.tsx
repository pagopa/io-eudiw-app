import { getAppVersion } from '@io-eudiw-app/commons';
import { selectSelectedMiniAppId } from '@io-eudiw-app/preferences';
import {
  hexToRgba,
  IOColors,
  IOText,
  useIOTheme,
  VStack
} from '@pagopa/io-app-design-system';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppSelector } from '../reducer';
import { DebugDataIndicator } from './DebugDataIndicator';
import { DebugDataOverlay } from './DebugDataOverlay';

const debugItemBgColor = hexToRgba(IOColors.white, 0.4);
const debugItemBorderColor = hexToRgba(IOColors.black, 0.1);

type DebugInfoOverlayProps = {
  clipboardSuccessMessage: string;
};

/**
 * Overlay which shows the debug data stored in the debug state.
 */
export const DebugInfoOverlay = ({
  clipboardSuccessMessage
}: DebugInfoOverlayProps) => {
  const theme = useIOTheme();
  const appVersion = getAppVersion();
  const miniApp = useAppSelector(selectSelectedMiniAppId);
  const [isDebugDataVisibile, showDebugData] = useState(false);

  const appVersionText = `DEBUG ENABLED: v${appVersion}\nMINI APP: ${miniApp}`;

  return (
    <>
      <SafeAreaView pointerEvents="box-none" style={styles.versionContainer}>
        <VStack space={4} style={{ alignItems: 'center' }}>
          <View style={styles.versionTextWrapper}>
            <IOText
              color={theme['textBody-secondary']}
              font="TitilliumSansPro"
              lineHeight={16}
              size={12}
              weight="Semibold"
            >
              {appVersionText}
            </IOText>
          </View>
          <DebugDataIndicator
            onPress={() => showDebugData(prevState => !prevState)}
          />
        </VStack>
      </SafeAreaView>
      {isDebugDataVisibile && (
        <DebugDataOverlay
          clipboardSuccessMessage={clipboardSuccessMessage}
          onDismissed={() => showDebugData(false)}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  versionContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'flex-start',
    top: Platform.OS === 'android' ? 0 : -8,
    zIndex: 1000
  },
  versionTextWrapper: {
    alignItems: 'center',
    backgroundColor: debugItemBgColor,
    borderColor: debugItemBorderColor,
    borderRadius: 8,
    borderWidth: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 4
  }
});
