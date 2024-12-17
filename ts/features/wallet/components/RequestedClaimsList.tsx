import {
  Divider,
  H6,
  Icon,
  IOColors,
  BodySmall
} from '@pagopa/io-app-design-system';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {t} from 'i18next';
import _ from 'lodash';
import {ClaimDisplayFormat} from '../utils/types';
import {
  claimScheme,
  dateSchema,
  getSafeText,
  stringSchema
} from '../utils/claims';

export type RequiredClaim = {
  claim: ClaimDisplayFormat;
  source: string;
};

type RequiredClaimsListProps = {
  items: ReadonlyArray<RequiredClaim>;
};

const RequiredClaimsList = ({items}: RequiredClaimsListProps) => (
  <View style={styles.container}>
    {items.map(({claim, source}, index) => (
      <View key={`${index}-${claim.label}`}>
        {/* Add a separator view between sections */}
        {index !== 0 && <Divider />}
        <View style={styles.dataItem}>
          <View>
            <ClaimText claim={claim} />
            <BodySmall weight="Regular" color="grey-700">
              {t('credentialIssuance.trust.dataSource', {ns: 'wallet', source})}
            </BodySmall>
          </View>
          <Icon name="checkTickBig" size={24} color="grey-300" />
        </View>
      </View>
    ))}
  </View>
);

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
  ) : _.isEmpty(displayValue) ? null : ( // We want to exclude empty strings and null values
    <H6>{getSafeText(displayValue)}</H6>
  );
};

export const getClaimDisplayValue = (
  claim: ClaimDisplayFormat
): string | Array<string> => {
  const decoded = claimScheme.safeParse(claim.value);
  if (decoded.success) {
    if (dateSchema.safeParse(decoded.data).success) {
      return decoded.data;
    } else if (stringSchema.safeParse(claim.value).success) {
      return decoded.data;
    } else {
      return t('wallet:claims.generic.notAvailable');
    }
  } else {
    return t('wallet:claims.generic.notAvailable');
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
