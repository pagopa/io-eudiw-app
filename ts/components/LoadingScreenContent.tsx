/**
 * An ingress screen to choose the real first screen the user must navigate to.
 */
import {
  ContentWrapper,
  H3,
  IOColors,
  useIOTheme,
  VStack,
  WithTestID
} from '@pagopa/io-app-design-system';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingIndicator } from './LoadingIndicator';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  }
});

const SPACE_BETWEEN_SPINNER_AND_TEXT = 24;

type LoadingScreenContentProps = WithTestID<{
  contentTitle: string;
  children?: React.ReactNode;
  headerVisible?: boolean;
}>;

/**
 * Screen content for a loading screen with a spinner and a title
 * @param contentTitle - The title of the loading screen.
 * @param children - Children nodes to be rendered after the spinner.
 * @param headerVisible - If true, the header will be visible.
 */
export const LoadingScreenContent = (props: LoadingScreenContentProps) => {
  const theme = useIOTheme();
  const { contentTitle, children, headerVisible, testID } = props;

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: IOColors[theme['appBackground-primary']] }
      ]}
      edges={headerVisible ? ['bottom'] : undefined}
      testID={testID}
    >
      <ContentWrapper>
        <VStack
          space={SPACE_BETWEEN_SPINNER_AND_TEXT}
          style={{ alignItems: 'center' }}
        >
          <View
            accessible={false}
            accessibilityElementsHidden={true}
            importantForAccessibility={'no-hide-descendants'}
          >
            <LoadingIndicator />
          </View>
          <H3
            style={{ textAlign: 'center' }}
            color={theme['textHeading-secondary']}
            accessibilityLabel={contentTitle}
          >
            {contentTitle}
          </H3>
        </VStack>
      </ContentWrapper>
      {children}
    </SafeAreaView>
  );
};
