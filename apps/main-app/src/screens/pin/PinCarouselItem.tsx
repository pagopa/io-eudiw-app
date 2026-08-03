import {
  Body,
  CodeInput,
  H4,
  IOVisualCostants,
  VSpacer,
  WithTestID
} from '@pagopa/io-app-design-system';
import { memo, RefObject } from 'react';
import { Dimensions, View } from 'react-native';

const { width } = Dimensions.get('screen');

export type PinCarouselItemProps = WithTestID<{
  description?: string;
  handleOnValidate: (val: string) => boolean;
  maxLength: number;
  onValueChange: (val: string) => void;
  title: string;
  titleRef?: RefObject<null | View>;
  value: string;
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
    description,
    handleOnValidate,
    maxLength,
    onValueChange,
    testID,
    title,
    titleRef,
    value
  }: PinCarouselItemProps) => (
    <View
      style={{
        alignItems: 'center',
        height: 128,
        justifyContent: 'space-between',
        paddingHorizontal: IOVisualCostants.appMarginDefault,
        width
      }}
      testID={testID}
    >
      <View>
        <H4 accessible ref={titleRef} testID={`${testID}_title`}>
          {title}
        </H4>
      </View>
      {description && (
        <Body
          accessible
          style={{ textAlign: 'center' }}
          testID={`${testID}_description`}
        >
          {description}
        </Body>
      )}
      <VSpacer size={32} />
      <CodeInput
        length={maxLength}
        onValidate={handleOnValidate}
        onValueChange={onValueChange}
        value={value}
        variant="neutral"
      />
    </View>
  )
);
