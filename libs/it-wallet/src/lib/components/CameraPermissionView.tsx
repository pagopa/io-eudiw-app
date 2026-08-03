import {
  BodySmall,
  H6,
  IOButton,
  IOButtonBlockSpecificProps,
  IOPictograms,
  Pictogram,
  VSpacer
} from '@pagopa/io-app-design-system';
import { StyleSheet, View } from 'react-native';

type Props = {
  action: Pick<
    IOButtonBlockSpecificProps,
    'accessibilityLabel' | 'label' | 'onPress'
  >;
  body: string;
  pictogram: IOPictograms;
  title: string;
};

/**
 * View component which shows an overlay to request camera permission.
 * @param title - The title of the overlay.
 * @param body - The body of the overlay.
 * @param action - The action to be performed when the button is pressed.
 * @param pictogram - The pictogram to be shown in the overlay.
 */
const CameraPermissionView = (props: Props) => (
  <View style={styles.container}>
    <Pictogram name={props.pictogram} pictogramStyle="light-content" />
    <VSpacer size={24} />
    <H6 color="white" style={styles.text}>
      {props.title}
    </H6>
    <VSpacer size={8} />
    <BodySmall color="white" style={styles.text} weight="Regular">
      {props.body}
    </BodySmall>
    <VSpacer size={32} />
    <IOButton
      accessibilityLabel={props.action.label}
      color="contrast"
      fullWidth={true}
      label={props.action.label}
      onPress={props.action.onPress}
      variant="solid"
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 32
  },
  text: {
    textAlign: 'center'
  }
});

export { CameraPermissionView };
