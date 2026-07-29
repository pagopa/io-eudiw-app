import {
  hexToRgba,
  HStack,
  Icon,
  IOColors,
  IOText
} from '@pagopa/io-app-design-system';
import _ from 'lodash';
import { Pressable, StyleSheet } from 'react-native';

import { useAppSelector } from '../reducer';
import { selectDebugData } from '../reducer/debug';

type DebugDataIndicatorProps = {
  onPress: () => void;
};

/**
 * This component renders an icon with a ladybug which opens the debug info overlay when pressed.
 * Used in {@link DebugInfoOverlay}
 */
export const DebugDataIndicator = (props: DebugDataIndicatorProps) => {
  const data = useAppSelector(selectDebugData);
  const dataSize = _.size(data);

  if (dataSize === 0) {
    return null;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={props.onPress}
      style={styles.wrapper}
    >
      <HStack space={4} style={{ alignItems: 'center' }}>
        <Icon color="warning-850" name="ladybug" size={16} />
        <IOText
          color="warning-850"
          font={'TitilliumSansPro'}
          size={14}
          style={{
            letterSpacing: 0.2,
            textTransform: 'uppercase'
          }}
          weight={'Semibold'}
        >
          {dataSize}
        </IOText>
      </HStack>
    </Pressable>
  );
};

const debugItemBgColor = hexToRgba(IOColors['warning-500'], 0.4);
const debugItemBorderColor = hexToRgba(IOColors['warning-850'], 0.1);

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    backgroundColor: debugItemBgColor,
    borderColor: debugItemBorderColor,
    borderRadius: 8,
    borderWidth: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 6
  }
});
