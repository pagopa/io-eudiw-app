import {
  Body,
  BodyProps,
  ComposedBodyFromArray,
  HSpacer,
  IOSpacer,
  IOStyles,
  VSpacer
} from '@pagopa/io-app-design-system';
import React, {ComponentProps, memo, useCallback} from 'react';
import {View} from 'react-native';

const BULLET_ITEM = '\u2022';

export type BulletListItem = {
  value: string | Array<BodyProps>;
  id: string | number;
  textProps?: ComponentProps<typeof Body>;
  list?: Array<Omit<BulletListItem, 'list'>>;
};

type Props = {
  title: string;
  list: Array<BulletListItem>;
  titleProps?: ComponentProps<typeof Body>;
  spacing?: IOSpacer;
};

/**
 * This component renders a bullet list. It supports two levels of nesting, so the first level `BulletListItem` can contain a `list` prop.
 *
 * @param title - The bullet list title
 * @param list - The array used to render the bullet list
 * @param titleProps - Used to customize title
 * @param spacing - Used to define list item indentation and space between title and list
 * */
export const BulletList = memo(
  ({title, list, spacing = 8, titleProps = {}}: Props) => {
    /**
     * @param {Array<BulletListItem>} [list] The list to iterate.
     * @param {number} [count=0] The number a recursive calls, used to stop the cycle when nesting level is equal to two.
     * @returns {JSX.Element} The rendered list.
     */
    const renderListItems = useCallback(
      (toRenderList?: Array<BulletListItem>, count: number = 0) =>
        toRenderList?.map(({id, value, textProps = {}, ...rest}) => (
          <View key={id} style={IOStyles.row}>
            <HSpacer size={spacing} />
            <Body>{BULLET_ITEM}</Body>
            <HSpacer size={spacing} />
            <Body {...textProps}>
              {Array.isArray(value) ? (
                <ComposedBodyFromArray body={value} />
              ) : (
                value
              )}
            </Body>
            {'list' in rest &&
              count === 0 &&
              renderListItems(rest.list, count + 1)}
          </View>
        )),
      [spacing]
    );

    return (
      <View>
        <Body {...titleProps}>{title}</Body>
        <VSpacer size={spacing} />
        <View accessible={true} accessibilityRole="list">
          {renderListItems(list)}
        </View>
      </View>
    );
  }
);
