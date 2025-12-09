import {
  Body,
  BodyProps,
  ComposedBodyFromArray,
  Divider,
  H2,
  ListItemHeader,
  ListItemInfo,
  VSpacer
} from '@pagopa/io-app-design-system';
import {View} from 'react-native';
import {IOScrollView, IOScrollViewActions} from './IOScrollView';

export type IOScrollViewWithListItems = {
  title?: string;
  subtitle?: string | Array<BodyProps>;
  renderItems: Array<ListItemInfo>;
  listItemHeaderLabel?: string;
  actions: IOScrollViewActions;
  isHeaderVisible?: boolean;
};

const ItemsList = ({items}: {items: Array<ListItemInfo>}) => (
  <>
    {items.map((item, index) => (
      <View key={`${item.value}-${index}`}>
        <ListItemInfo
          {...item}
          accessibilityLabel={`${item.label}; ${item.value}`}
        />
        {index < items.length - 1 && <Divider />}
      </View>
    ))}
  </>
);

/**
 * A component that renders a scrollable view with a list of `ListItemInfo`
 * @param title - The title of the list
 * @param subtitle - The subtitle of the list, which can be a string or an array of `BodyProps`
 * @param renderItems - The array of `ListItemInfo` to be rendered in the list
 * @param listItemHeaderLabel - The label for the list item header
 * @param actions - The actions for the IOScrollView component
 * @param isHeaderVisible- A flag indicating whether the header is visible or not
 */
export const IOScrollViewWithListItems = ({
  title,
  subtitle,
  actions,
  renderItems,
  listItemHeaderLabel
}: IOScrollViewWithListItems) => (
  <IOScrollView actions={actions}>
    <H2>{title}</H2>
    {subtitle && (
      <>
        <VSpacer size={8} />
        {typeof subtitle === 'string' ? (
          <Body>{subtitle}</Body>
        ) : (
          <ComposedBodyFromArray body={subtitle} />
        )}
      </>
    )}
    {listItemHeaderLabel && (
      <>
        <VSpacer size={16} />
        <ListItemHeader label={listItemHeaderLabel} />
      </>
    )}
    <ItemsList items={renderItems} />
  </IOScrollView>
);
