import {
  BodySmall,
  ButtonSolid,
  ButtonSolidProps,
  H6,
  IOPictograms,
  Pictogram,
  VSpacer
} from '@pagopa/io-app-design-system';
import {StyleSheet, View} from 'react-native';

type Props = {
  title: string;
  body: string;
  action: Pick<ButtonSolidProps, 'label' | 'accessibilityLabel' | 'onPress'>;
  pictogram: IOPictograms;
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
    <BodySmall weight="Regular" color="white" style={styles.text}>
      {props.body}
    </BodySmall>
    <VSpacer size={32} />
    <ButtonSolid
      label={props.action.label}
      accessibilityLabel={props.action.label}
      onPress={props.action.onPress}
      color="contrast"
      fullWidth={true}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 32,
    alignItems: 'center'
  },
  text: {
    textAlign: 'center'
  }
});

export {CameraPermissionView};
