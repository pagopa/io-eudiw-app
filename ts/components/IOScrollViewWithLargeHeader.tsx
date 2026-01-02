import {
  Body,
  BodyProps,
  ComposedBodyFromArray,
  ContentWrapper,
  H2,
  BodySmall,
  VSpacer,
  useIOTheme,
  WithTestID,
  IOVisualCostants
} from '@pagopa/io-app-design-system';
import { ComponentProps, forwardRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { IOScrollView } from './IOScrollView';

export type LargeHeaderTitleProps = {
  label: string;
  accessibilityLabel?: string;
  testID?: string;
  section?: string;
};

type Props = WithTestID<{
  children?: React.ReactNode;
  actions?: ComponentProps<typeof IOScrollView>['actions'];
  title: LargeHeaderTitleProps;
  description?: string | Array<BodyProps>;
  includeContentMargins?: boolean;
  excludeEndContentMargin?: boolean;
}>;

/**
 * Special `IOScrollView` screen with a large title that is hidden by a transition when
 * the user scrolls. It also handles the contextual help and the FAQ.
 * Use of LargeHeader naming is due to similar behavior offered by the native iOS API.
 */
export const IOScrollViewWithLargeHeader = forwardRef<View, Props>(
  (
    {
      children,
      title,
      description,
      actions,
      includeContentMargins = false,
      excludeEndContentMargin,
      testID
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
        snapOffset={titleHeight}
        includeContentMargins={false}
        excludeEndContentMargin={excludeEndContentMargin}
        testID={testID}
      >
        <View
          ref={ref}
          accessible
          style={styles.titleContainer}
          onLayout={getTitleHeight}
        >
          {title.section && (
            <BodySmall weight="Semibold" color={theme['textBody-tertiary']}>
              {title.section}
            </BodySmall>
          )}
          <H2
            color={theme['textHeading-default']}
            testID={title?.testID}
            accessibilityLabel={title.accessibilityLabel ?? title.label}
            accessibilityRole="header"
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
