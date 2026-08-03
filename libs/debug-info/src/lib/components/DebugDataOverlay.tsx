import {
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppSelector } from '../reducer';
import { selectDebugData } from '../reducer/debug';
import { DebugPrettyPrint } from './DebugPrettyPrint';

type DebugDataOverlayProps = {
  clipboardSuccessMessage: string;
  onDismissed?: () => void;
};

/**
 * Debug overlay to show all the debug data in a list for each entry in the debug state via {@link DebugPrettyPrint}.
 * Used in {@link DebugInfoOverlay}
 */
export const DebugDataOverlay = ({
  clipboardSuccessMessage,
  onDismissed
}: DebugDataOverlayProps) => {
  const debugData = useAppSelector(selectDebugData);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback accessibilityRole="none" onPress={onDismissed}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        style={styles.scroll}
      >
        {Object.entries(debugData).map(([key, value]) => (
          <DebugPrettyPrint
            clipboardSuccessMessage={clipboardSuccessMessage}
            data={value}
            expandable={true}
            isExpanded={false}
            key={`debug_data_${key}`}
            title={key}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const overlayColor = '#000000B0';

const styles = StyleSheet.create({
  container: {
    bottom: 0,
    left: 0,
    paddingTop: 60,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 999
  },
  overlay: {
    backgroundColor: overlayColor,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0
  },
  scroll: {
    flexGrow: 0
  },
  scrollContainer: {
    paddingHorizontal: 16
  }
});
