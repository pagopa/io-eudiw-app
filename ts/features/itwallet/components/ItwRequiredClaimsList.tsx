import { pipe } from "fp-ts/lib/function";
import React from "react";
import * as E from "fp-ts/Either";
import * as RA from "fp-ts/lib/ReadonlyArray";
import { View, StyleSheet } from "react-native";
import {
  Divider,
  H6,
  Icon,
  IOColors,
  LabelSmall
} from "@pagopa/io-app-design-system";
import { DateFromString } from "@pagopa/ts-commons/lib/dates";
import { isStringNullyOrEmpty } from "../../../utils/strings";
import {
  ClaimDisplayFormat,
  ClaimValue,
  DrivingPrivilegesClaim,
  EvidenceClaim,
  PlaceOfBirthClaim,
  PlainTextClaim
} from "../utils/itwClaimsUtils";
import { localeDateFormat } from "../../../utils/locale";
import I18n from "../../../i18n";

export type RequiredClaim = {
  claim: ClaimDisplayFormat;
  source: string;
};

type ItwRequiredClaimsListProps = {
  items: ReadonlyArray<RequiredClaim>;
};

/**
 * Component which renders the claim value or multiple values in case of an array.
 * If the claim is an empty string or null, it will not render it.
 * @param claim The claim to render.
 * @returns An {@link H6} element with the claim value or multiple {@link H6} elements in case of an array.
 */
const ClaimText = ({ claim }: { claim: ClaimDisplayFormat }) => {
  const displayValue = getClaimDisplayValue(claim);
  return Array.isArray(displayValue) ? (
    <>
      {displayValue.map((value, index) => {
        return <H6 key={`${index}_${value}`}>{value}</H6>;
      })}
    </>
  ) : isStringNullyOrEmpty(displayValue) ? null : ( // We want to exclude empty strings and null values
    <H6>{displayValue}</H6>
  );
};

/**
 * Component which renders a claim.
 * It renders a different component based on the type of the claim.
 * @param claim - the claim to render.
 */
const getClaimDisplayValue = (claim: ClaimDisplayFormat) =>
  pipe(
    claim.value,
    ClaimValue.decode,
    E.fold(
      () => I18n.t("features.itWallet.generic.placeholders.claimNotAvailable"),
      decoded => {
        if (PlaceOfBirthClaim.is(decoded)) {
          return `${decoded.locality} (${decoded.country})`;
        } else if (DateFromString.is(decoded)) {
          return localeDateFormat(
            decoded,
            I18n.t("global.dateFormats.shortFormat")
          );
        } else if (EvidenceClaim.is(decoded)) {
          return decoded[0].record.source.organization_name;
        } else if (DrivingPrivilegesClaim.is(decoded)) {
          return decoded.vehicle_category_code;
        } else if (PlainTextClaim.is(decoded)) {
          return decoded;
        } else {
          return I18n.t(
            "features.itWallet.generic.placeholders.claimNotAvailable"
          );
        }
      }
    )
  );

const ItwRequiredClaimsList = ({ items }: ItwRequiredClaimsListProps) => (
  <View style={styles.container}>
    {pipe(
      items,
      RA.map(a => a),
      RA.mapWithIndex((index, { claim, source }) => (
        <View key={`${index}-${claim.label}-${source}`}>
          {/* Add a separator view between sections */}
          {index !== 0 && <Divider />}
          <View style={styles.dataItem}>
            <View>
              <ClaimText claim={claim} />
              <LabelSmall weight="Regular" color="grey-700">
                {I18n.t("features.itWallet.generic.dataSource.single", {
                  credentialSource: source
                })}
              </LabelSmall>
            </View>
            <Icon name="checkTickBig" size={24} color="grey-300" />
          </View>
        </View>
      ))
    )}
  </View>
);

export { ItwRequiredClaimsList };

const styles = StyleSheet.create({
  container: {
    backgroundColor: IOColors["grey-50"],
    borderRadius: 8,
    paddingHorizontal: 24
  },
  dataItem: {
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  }
});
