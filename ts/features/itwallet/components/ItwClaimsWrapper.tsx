import React, { PropsWithChildren } from "react";
import { Image, ImageBackground, StyleSheet, View } from "react-native";
import { H6, IOColors, IOStyles } from "@pagopa/io-app-design-system";
import {
  CredentialCatalogDisplay,
  getImageFromCredentialType
} from "../utils/itwMocksUtils";

/**
 * Props of the component.
 * @param displayData - the display data of the credential.
 * @param children - the children of the component.
 * @param type - the credential type.
 */
type Props = PropsWithChildren<{
  displayData: CredentialCatalogDisplay;
  type: string;
}>;

/**
 * Const used to set the border radius of the body and the ImageBackground component.
 */
const BORDER_RADIUS = 16;

/**
 * Renders a wrapper for the claims of a credential which shows an header with background image and title.
 */
const ItwClaimsWrapper = ({ displayData, children, type }: Props) => (
  <>
    <View style={styles.body}>
      <View style={styles.imageWrapper}>
        <ImageBackground
          source={getImageFromCredentialType(type)}
          resizeMode="stretch"
          style={[
            styles.backgroundImage,
            {
              height: Image.resolveAssetSource(getImageFromCredentialType(type))
                .height
            }
          ]}
        >
          <View style={styles.header}>
            <H6 color={displayData.textColor} style={styles.title}>
              {displayData.title}
            </H6>
          </View>
        </ImageBackground>
      </View>
      {children && <View style={styles.container}>{children}</View>}
    </View>
  </>
);

const styles = StyleSheet.create({
  header: {
    paddingVertical: 12,
    paddingHorizontal: 24
  },
  title: {
    textTransform: "uppercase"
  },
  imageWrapper: {
    position: "relative",
    height: 72,
    overflow: "hidden",
    ...IOStyles.horizontalContentPadding
  },
  backgroundImage: {
    borderTopLeftRadius: BORDER_RADIUS,
    borderTopRightRadius: BORDER_RADIUS,
    overflow: "hidden"
  },
  body: {
    backgroundColor: IOColors.white
  },
  container: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: IOColors.white,
    shadowColor: IOColors.bluegreyDark,
    shadowOffset: {
      width: 0,
      height: -1
    },
    shadowOpacity: 0.2,
    shadowRadius: 2.0,
    elevation: 4
  }
});

export default ItwClaimsWrapper;
