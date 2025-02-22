import {Divider, ListItemInfo} from '@pagopa/io-app-design-system';
import React, {Fragment} from 'react';
import i18next from 'i18next';
import {useTranslation} from 'react-i18next';
import {
  claimScheme,
  drivingPrivilegesSchema,
  DrivingPrivilegesType,
  verificationEvidenceSchema,
  VerificationEvidenceType
} from '../../utils/claims';
import {ClaimDisplayFormat} from '../../utils/types';
import {useIOBottomSheetModal} from '../../../../hooks/useBottomSheet';
import {getSafeText} from '../../../../utils/string';

/**
 * Component which renders a generic text type claim.
 * @param label - the label of the claim
 * @param claim - the claim value
 */
const PlainTextClaimItem = ({label, claim}: {label: string; claim: string}) => {
  const safeText = getSafeText(claim);
  return (
    <ListItemInfo
      numberOfLines={2}
      label={label}
      value={safeText}
      accessibilityLabel={`${label} ${safeText}`}
    />
  );
};

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
 * Component which renders a driving privileges type claim.
 * It features a bottom sheet with information about the issued and expiration date of the claim.
 * @param label the label of the claim
 * @param claim the claim value
 * @param detailsButtonVisible a flag to show or hide the details button
 * @returns a list item component with the driving privileges claim
 */
const DrivingPrivilegesClaimItem = ({
  label,
  claim,
  detailsButtonVisible = true
}: {
  label: string;
  claim: DrivingPrivilegesType[0];
  detailsButtonVisible?: boolean;
}) => {
  const {issue_date, expiry_date, vehicle_category_code} = claim;
  const localIssueDate = new Date(issue_date).toLocaleDateString();
  const localExpiryDate = new Date(expiry_date).toLocaleDateString();
  const {t} = useTranslation(['wallet', 'global']);
  const privilegeBottomSheet = useIOBottomSheetModal({
    title: t('wallet:claims.generic.category', {
      category: vehicle_category_code
    }),
    component: (
      <>
        <ListItemInfo
          label={t('wallet:claims.generic.issueDate')}
          value={localIssueDate}
          accessibilityLabel={`${t(
            'wallet:claims.generic.issueDate'
          )} ${localIssueDate}`}
        />
        <Divider />
        <ListItemInfo
          label={t('wallet:claims.generic.expiryDate')}
          value={claim.expiry_date}
          accessibilityLabel={`${t(
            'wallet:claims.generic.expiryDate'
          )} ${localExpiryDate}`}
        />
      </>
    )
  });

  const endElement: ListItemInfo['endElement'] = detailsButtonVisible
    ? {
        type: 'buttonLink',
        componentProps: {
          label: t('global:buttons.show'),
          onPress: () => privilegeBottomSheet.present(),
          accessibilityLabel: t('global:buttons.show')
        }
      }
    : undefined;

  return (
    <>
      <ListItemInfo
        label={label}
        value={claim.vehicle_category_code}
        endElement={endElement}
        accessibilityLabel={`${label} ${claim.vehicle_category_code}`}
      />
      {privilegeBottomSheet.bottomSheet}
    </>
  );
};

/**
 * Component which renders a verification evidence type claim.
 * It features a bottom sheet with information about the organization id, name and country code.
 */
export const VerificationEvidenceClaimItem = ({
  label,
  claim,
  detailsButtonVisible = true
}: {
  label: string;
  claim: VerificationEvidenceType;
  detailsButtonVisible: boolean;
}) => {
  const {organization_id, organization_name, country_code} = claim;
  const {t} = useTranslation(['wallet', 'global']);
  const verificationBottomSheet = useIOBottomSheetModal({
    title: organization_name,
    component: (
      <>
        <ListItemInfo
          label={t('wallet:claims.mdl.verificationEvidence.organizationId')}
          value={organization_id}
          accessibilityLabel={`${t(
            'wallet:claims.mdl.verificationEvidence.organizationId'
          )} ${organization_id}`}
        />
        <Divider />
        <ListItemInfo
          label={t('wallet:claims.mdl.verificationEvidence.countryCode')}
          value={country_code}
          accessibilityLabel={`${t(
            'wallet:claims.mdl.verificationEvidence.countryCode'
          )} ${country_code}`}
        />
      </>
    )
  });

  const endElement: ListItemInfo['endElement'] = detailsButtonVisible
    ? {
        type: 'buttonLink',
        componentProps: {
          label: t('global:buttons.show'),
          onPress: () => verificationBottomSheet.present(),
          accessibilityLabel: t('global:buttons.show')
        }
      }
    : undefined;

  return (
    <>
      <ListItemInfo
        label={label}
        value={organization_name}
        endElement={endElement}
        accessibilityLabel={`${label} ${organization_name}`}
      />
      {verificationBottomSheet.bottomSheet}
    </>
  );
};

/**
 * Component which renders a claim.
 * It renders a different component based on the type of the claim.
 * @param claim - the claim to render
 */
export const CredentialClaim = ({
  claim,
  isPreview
}: {
  claim: ClaimDisplayFormat;
  isPreview: boolean;
}) => {
  const decoded = claimScheme.safeParse(claim.value);
  /**
   * It seems like there's no way to get the type in typescript after the safeParse method is called inside the if statement.
   * Thus type casting is required.
   */
  if (decoded.success) {
    if (decoded.data instanceof Date) {
      return <DateClaimItem label={claim.label} claim={decoded.data} />;
    } else if (drivingPrivilegesSchema.safeParse(decoded.data).success) {
      const privileges = decoded.data as DrivingPrivilegesType;
      return (
        <>
          {privileges.map((elem, index) => (
            <Fragment
              key={`${index}_${claim.label}_${elem.vehicle_category_code}`}>
              {index !== 0 && <Divider />}
              <DrivingPrivilegesClaimItem
                label={claim.label}
                claim={elem}
                detailsButtonVisible={!isPreview}
              />
            </Fragment>
          ))}
        </>
      );
    } else if (verificationEvidenceSchema.safeParse(decoded.data).success) {
      return (
        <VerificationEvidenceClaimItem
          label={claim.label}
          claim={decoded.data as VerificationEvidenceType}
          detailsButtonVisible={!isPreview}
        />
      );
    } else if (typeof decoded.data === 'string') {
      return (
        <PlainTextClaimItem
          label={claim.label}
          claim={decoded.data as string}
        />
      );
    } else {
      return <UnknownClaimItem label={claim.label} />;
    }
  } else {
    return <UnknownClaimItem label={claim.label} />;
  }
};
