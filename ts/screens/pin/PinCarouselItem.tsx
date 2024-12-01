import {
  IOStyles,
  H4,
  VSpacer,
  CodeInput,
  Body,
  WithTestID
} from '@pagopa/io-app-design-system';
import React, {RefObject, memo} from 'react';
import {Dimensions, View} from 'react-native';

const {width} = Dimensions.get('screen');

export type PinCarouselItemProps = WithTestID<{
  title: string;
  titleRef?: RefObject<View>;
  description?: string;
  value: string;
  maxLength: number;
  handleOnValidate: (val: string) => boolean;
  onValueChange: (val: string) => void;
}>;

/**
 * A carousel item for the PIN creation process.
 * @param title - Title of the item
 * @param titleRef - Reference to the title
 * @param description -Description of the item
 * @param value - Value of the item
 * @param maxLength - Naximum length of the value
 * @param handleOnValidate - Function to validate the value
 * @param onValueChange - Function to handle the value change
 */
export const PinCarouselItem = memo(
  ({
    title,
    description,
    value,
    testID,
    titleRef,
    maxLength,
    handleOnValidate,
    onValueChange
  }: PinCarouselItemProps) => (
    <View
      style={[
        IOStyles.horizontalContentPadding,
        IOStyles.alignCenter,
        {
          height: 128,
          justifyContent: 'space-between',
          width
        }
      ]}
      testID={testID}>
      <View>
        <H4 ref={titleRef} accessible testID={`${testID}_title`}>
          {title}
        </H4>
      </View>
      {description && (
        <Body
          accessible
          testID={`${testID}_description`}
          style={{textAlign: 'center'}}>
          {description}
        </Body>
      )}
      <VSpacer size={32} />
      <CodeInput
        length={maxLength}
        onValidate={handleOnValidate}
        onValueChange={onValueChange}
        variant="dark"
        value={value}
      />
    </View>
  )
);
