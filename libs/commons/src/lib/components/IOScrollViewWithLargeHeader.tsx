import {
  Body,
  BodyProps,
  BodySmall,
  ComposedBodyFromArray,
  ContentWrapper,
  H2,
  IOVisualCostants,
  useIOTheme,
  VSpacer,
  WithTestID
} from '@pagopa/io-app-design-system';
import { ComponentProps, forwardRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';

import { IOScrollView } from './IOScrollView';

type LargeHeaderTitleProps = {
  accessibilityLabel?: string;
  label: string;
  section?: string;
  testID?: string;
};

type Props = WithTestID<{
  actions?: ComponentProps<typeof IOScrollView>['actions'];
  children?: React.ReactNode;
  description?: BodyProps[] | string;
  excludeEndContentMargin?: boolean;
  includeContentMargins?: boolean;
  title: LargeHeaderTitleProps;
}>;

/**
 * Special `IOScrollView` screen with a large title that is hidden by a transition when
 * the user scrolls. It also handles the contextual help and the FAQ.
 * Use of LargeHeader naming is due to similar behavior offered by the native iOS API.
 */
export const IOScrollViewWithLargeHeader = forwardRef<View, Props>(
  (
    {
      actions,
      children,
      description,
      excludeEndContentMargin,
      includeContentMargins = false,
      testID,
      title
    },
    ref
  ) => {
    const [titleHeight, setTitleHeight] = useState(0);

    const theme = useIOTheme();

    const getTitleHeight = (event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout;
      setTitleHeight(height);
    };

    return (
      <IOScrollView
        actions={actions}
        excludeEndContentMargin={excludeEndContentMargin}
        includeContentMargins={false}
        snapOffset={titleHeight}
        testID={testID}
      >
        <View
          accessible
          onLayout={getTitleHeight}
          ref={ref}
          style={styles.titleContainer}
        >
          {title.section && (
            <BodySmall color={theme['textBody-tertiary']} weight="Semibold">
              {title.section}
            </BodySmall>
          )}
          <H2
            accessibilityLabel={title.accessibilityLabel ?? title.label}
            accessibilityRole="header"
            color={theme['textHeading-default']}
            testID={title?.testID}
          >
            {title.label}
          </H2>
        </View>

        {description && (
          <ContentWrapper>
            <VSpacer size={16} />
            {typeof description === 'string' ? (
              <Body color={theme['textBody-tertiary']}>{description}</Body>
            ) : (
              <ComposedBodyFromArray body={description} textAlign="left" />
            )}
          </ContentWrapper>
        )}
        {children && (
          <>
            <VSpacer size={16} />
            {includeContentMargins ? (
              <ContentWrapper>{children}</ContentWrapper>
            ) : (
              children
            )}
          </>
        )}
      </IOScrollView>
    );
  }
);

const styles = StyleSheet.create({
  titleContainer: {
    paddingHorizontal: IOVisualCostants.appMarginDefault
  }
});
