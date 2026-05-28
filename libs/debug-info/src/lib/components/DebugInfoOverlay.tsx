import {
  IOColors,
  IOText,
  VStack,
  hexToRgba,
  useIOTheme
} from '@pagopa/io-app-design-system';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DebugDataIndicator } from './DebugDataIndicator';
import { DebugDataOverlay } from './DebugDataOverlay';
import { getAppVersion } from '@io-eudiw-app/commons';
import { selectSelectedMiniAppId } from '@io-eudiw-app/preferences';
import { useAppSelector } from '../reducer';

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
      <SafeAreaView style={styles.versionContainer} pointerEvents="box-none">
        <VStack space={4} style={{ alignItems: 'center' }}>
          <View style={styles.versionTextWrapper}>
            <IOText
              color={theme['textBody-secondary']}
              font="TitilliumSansPro"
              weight="Semibold"
              size={12}
              lineHeight={16}
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
          onDismissed={() => showDebugData(false)}
          clipboardSuccessMessage={clipboardSuccessMessage}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  versionContainer: {
    ...StyleSheet.absoluteFillObject,
    top: Platform.OS === 'android' ? 0 : -8,
    justifyContent: 'flex-start',
    alignItems: 'center',
    zIndex: 1000
  },
  versionTextWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: debugItemBorderColor,
    borderWidth: 1,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: debugItemBgColor
  }
});
