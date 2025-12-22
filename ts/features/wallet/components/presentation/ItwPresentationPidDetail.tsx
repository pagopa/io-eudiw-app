import { Divider, ListItemHeader } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { Fragment } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import I18n from "i18next";
import { StoredCredential } from "../../utils/types";
import { useNavigation } from "@react-navigation/native";
import { parseClaims } from "../../utils/claims";
import { WellKnownClaim } from "../../utils/itwClaimsUtils";
import { ItwEidLifecycleAlert } from "../ItwEidLifecycleAlert";
import { ItwCredentialClaim } from "../credential/ItwCredentialClaim";
import { MainNavigatorParamsList } from "../../../../navigation/main/MainStackNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type Props = {
  credential: StoredCredential;
};

export const ItwPresentationPidDetail = ({ credential }: Props) => {
  const [claimsHidden, setClaimsHidden] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<MainNavigatorParamsList>>();

  const listItemHeaderLabel = I18n.t(
    "features.itWallet.presentation.itWalletId.listItemHeader"
  );
  const claims = useMemo(
    () =>
      parseClaims(credential.parsedCredential, {
        exclude: [WellKnownClaim.unique_id, WellKnownClaim.content]
      }),
    [credential.parsedCredential]
  );

  const endElement = useMemo<ListItemHeader["endElement"]>(
    () => ({
      type: "iconButton",
      componentProps: {
        icon: claimsHidden ? "eyeHide" : "eyeShow",
        accessibilityLabel: listItemHeaderLabel,
        onPress: () => setClaimsHidden(state => !state)
      }
    }),
    [claimsHidden, listItemHeaderLabel]
  );

  return (
    <View>
      <ItwEidLifecycleAlert navigation={navigation} />
      {claims.length > 0 && (
        <ListItemHeader label={listItemHeaderLabel} endElement={endElement} />
      )}
      {claims.map((claim, index) => (
        <Fragment key={claim.id}>
          {index !== 0 && <Divider />}
          <ItwCredentialClaim claim={claim} isPreview hidden={claimsHidden} />
        </Fragment>
      ))}
      {claims.length > 0 && <Divider />}
      <ItwIssuanceMetadata credential={credential} />
    </View>
  );
};
