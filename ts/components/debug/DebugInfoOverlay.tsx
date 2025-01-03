import {IOText, VStack, useIOTheme} from '@pagopa/io-app-design-system';
import * as React from 'react';
import {useState} from 'react';
import {Platform, SafeAreaView, StyleSheet} from 'react-native';
import {getAppVersion} from '../../utils/device';
import {DebugDataIndicator} from './DebugDataIndicator';
import {DebugDataOverlay} from './DebugDataOverlay';

/**
 * Overlay which shows the debug data stored in the debug state.
 */
const DebugInfoOverlay = () => {
  const theme = useIOTheme();
  const appVersion = getAppVersion();
  const [isDebugDataVisibile, showDebugData] = useState(false);

  const appVersionText = `v. ${appVersion}`;

  return (
    <>
      <SafeAreaView style={styles.versionContainer} pointerEvents="box-none">
        <VStack space={4} style={{alignItems: 'center'}}>
          <IOText
            color={theme['textBody-secondary']}
            font="TitilliumSansPro"
            weight="Semibold"
            size={12}
            lineHeight={16}>
            {appVersionText}
          </IOText>
          <DebugDataIndicator
            onPress={() => showDebugData(prevState => !prevState)}
          />
        </VStack>
      </SafeAreaView>
      {isDebugDataVisibile && (
        <DebugDataOverlay onDismissed={() => showDebugData(false)} />
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
  }
});

export default DebugInfoOverlay;
