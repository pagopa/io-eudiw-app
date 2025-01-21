import {ListItemInfo} from '@pagopa/io-app-design-system';
import React from 'react';
import i18next from 'i18next';
import {claimScheme, dateSchema, stringSchema} from '../../utils/claims';
import {ClaimDisplayFormat} from '../../utils/types';

/**
 * Component which renders a generic text type claim.
 * @param label - the label of the claim
 * @param claim - the claim value
 */
const PlainTextClaimItem = ({label, claim}: {label: string; claim: string}) => (
  <ListItemInfo
    numberOfLines={2}
    label={label}
    value={claim}
    accessibilityLabel={`${label} ${claim}`}
  />
);

/**
 * Component which renders a date type claim with an optional icon and expiration badge.
 * @param label - the label of the claim
 * @param claim - the value of the claim
 */
const DateClaimItem = ({label, claim}: {label: string; claim: Date}) => {
  const value = claim.toLocaleDateString();

  return (
    <ListItemInfo
      key={`${label}-${value}`}
      label={label}
      value={value}
      accessibilityLabel={`${label} ${value}`}
    />
  );
};

/**
 * Component which renders a claim of unknown type with a placeholder.
 * @param label - the label of the claim
 * @param _claim - the claim value of unknown type. We are not interested in its value but it's needed for the exaustive type checking.
 */
const UnknownClaimItem = ({label}: {label: string}) => (
  <PlainTextClaimItem
    label={label}
    claim={i18next.t('wallet:claims.generic.notAvailable')}
  />
);

/**
 * Component which renders a claim.
 * It renders a different component based on the type of the claim.
 * @param claim - the claim to render
 */
export const CredentialClaim = ({claim}: {claim: ClaimDisplayFormat}) => {
  const decoded = claimScheme.safeParse(claim.value);
  if (decoded.success) {
    if (dateSchema.safeParse(decoded.data).success) {
      return (
        <DateClaimItem label={claim.label} claim={new Date(decoded.data)} />
      );
    } else if (stringSchema.safeParse(claim.value).success) {
      return <PlainTextClaimItem label={claim.label} claim={decoded.data} />;
    } else {
      return <UnknownClaimItem label={claim.label} />;
    }
  } else {
    return <UnknownClaimItem label={claim.label} />;
  }
};
