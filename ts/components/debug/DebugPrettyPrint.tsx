import {
  BodySmall,
  HStack,
  IOColors,
  IOText,
  IconButton,
  useIOToast
} from '@pagopa/io-app-design-system';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {useTranslation} from 'react-i18next';
import {truncateObjectStrings} from '../../utils/debug';
import {Prettify} from '../../types/utils';
import {withDebugEnabled} from './withDebugEnabled';

type ExpandableProps =
  | {
      expandable: true;
      isExpanded?: boolean;
    }
  | {
      expandable?: false;
      isExpanded?: undefined;
    };

type Props = Prettify<
  {
    title: string;
    data: any;
  } & ExpandableProps
>;

/**
 * This component allows to print the content of an object in an elegant and readable way.
 * and to copy its content to the clipboard by pressing on the copy button.
 * The component it is rendered only if debug mode is enabled
 */
export const DebugPrettyPrint = withDebugEnabled(
  ({title, data, expandable = true, isExpanded = false}: Props) => {
    const toast = useIOToast();
    const [expanded, setExpanded] = React.useState(isExpanded);
    const {t} = useTranslation('global');

    const content = React.useMemo(() => {
      if ((expandable && !expanded) || !expandable) {
        return null;
      }

      return (
        <View style={styles.content} pointerEvents="box-only">
          <IOText
            font="DMMono"
            size={12}
            lineHeight={18}
            color="bluegrey"
            weight="Medium">
            {JSON.stringify(truncateObjectStrings(data), null, 2)}
          </IOText>
        </View>
      );
    }, [data, expandable, expanded]);

    /**
     * Copy a text to the device clipboard and give a feedback.
     */
    const clipboardSetStringWithFeedback = (text: string) => {
      Clipboard.setString(text);
      toast.success(t('clipboard.copyFeedback'));
    };

    return (
      <View testID="DebugPrettyPrintTestID" style={styles.container}>
        <View style={styles.header}>
          <BodySmall weight="Semibold" color="white">
            {title}
          </BodySmall>
          <HStack space={16}>
            <IconButton
              icon={'copy'}
              accessibilityLabel="copy"
              iconSize={20}
              onPress={() =>
                clipboardSetStringWithFeedback(JSON.stringify(data, null, 2))
              }
              color="contrast"
            />
            {expandable && (
              <IconButton
                icon={expanded ? 'eyeHide' : 'eyeShow'}
                accessibilityLabel="show"
                iconSize={24}
                onPress={() => setExpanded(_ => !_)}
                color="contrast"
              />
            )}
          </HStack>
        </View>
        {content}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 4
  },
  header: {
    backgroundColor: IOColors['error-600'],
    padding: 12,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  content: {
    backgroundColor: IOColors['grey-50'],
    padding: 8
  }
});
