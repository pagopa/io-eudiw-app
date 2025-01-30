import {
  Divider,
  H6,
  IOColors,
  BodySmall,
  AnimatedCheckbox
} from '@pagopa/io-app-design-system';
import {StyleSheet, View} from 'react-native';
import React from 'react';
import i18next from 'i18next';
import {Descriptor} from '../../store/presentation';
import {ClaimDisplayFormat} from '../../utils/types';
import {getSafeText, isStringNullyOrEmpty} from '../../../../utils/string';
import {claimScheme, dateSchema, stringSchema} from '../../utils/claims';

export type RequiredClaims = {
  descriptor: Descriptor;
  source: string;
};

/**
 * Component that renders the list of required claims for a credential during the presentation.
 * @param descriptor - The descriptor of the credential
 * @param source - The source of the claim
 * @returns
 */
const RequiredClaimsList = ({descriptor, source}: RequiredClaims) => {
  const {requiredDisclosures} = descriptor;
  return (
    <View style={styles.container}>
      {requiredDisclosures.map((claim, index) => (
        <View key={`${index}-${claim.decoded[index]}`}>
          {/* Add a separator view between sections */}
          {index !== 0 && <Divider />}
          <View style={styles.dataItem}>
            <View>
              <ClaimText
                claim={{
                  id: claim.decoded[0],
                  label: claim.decoded[1],
                  value: claim.decoded[2]
                }}
              />
              <BodySmall weight="Regular" color="grey-700">
                {source}
              </BodySmall>
            </View>
            <AnimatedCheckbox checked={true} />
          </View>
        </View>
      ))}
    </View>
  );
};

/**
 * Component which renders the claim value or multiple values in case of an array.
 * If the claim is an empty string or null, it will not render it.
 * @param claim The claim to render
 * @returns An {@link H6} element with the claim value or multiple {@link H6} elements in case of an array
 */
const ClaimText = ({claim}: {claim: ClaimDisplayFormat}) => {
  const displayValue = getClaimDisplayValue(claim);
  return Array.isArray(displayValue) ? (
    displayValue.map((value, index) => {
      const safeValue = getSafeText(value);
      return <H6 key={`${index}_${safeValue}`}>{safeValue}</H6>;
    })
  ) : isStringNullyOrEmpty(displayValue) ? null : ( // We want to exclude empty strings and null values
    <H6>{getSafeText(displayValue)}</H6>
  );
};

export const getClaimDisplayValue = (
  claim: ClaimDisplayFormat
): string | Array<string> => {
  const decoded = claimScheme.safeParse(claim.value);
  if (decoded.success) {
    if (dateSchema.safeParse(decoded.data).success) {
      return new Date(decoded.data).toLocaleDateString();
    } else if (stringSchema.safeParse(claim.value).success) {
      return decoded.data;
    } else {
      return i18next.t('wallet:claims.generic.notAvailable');
    }
  } else {
    return i18next.t('wallet:claims.generic.notAvailable');
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: IOColors['grey-50'],
    borderRadius: 8,
    paddingHorizontal: 24
  },
  dataItem: {
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
});

export default RequiredClaimsList;
