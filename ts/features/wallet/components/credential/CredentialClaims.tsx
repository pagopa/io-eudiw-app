import {Divider, ListItemInfo} from '@pagopa/io-app-design-system';
import React, {Fragment, memo} from 'react';
import i18next from 'i18next';
import {useTranslation} from 'react-i18next';
import {Image} from 'react-native';
import {
  claimScheme,
  DrivingPrivilegesType,
  VerificationEvidenceType
} from '../../utils/claims';
import {ClaimDisplayFormat} from '../../utils/types';
import {useIOBottomSheetModal} from '../../../../hooks/useBottomSheet';
import {getSafeText} from '../../../../utils/string';

/**
 * Component which renders a generic text type claim.
 * @param label - the label of the claim
 * @param claim - the claim value
 * @param reversed - whether the claim label is displayed before the value or not
 */
const PlainTextClaimItem = ({
  label,
  claim,
  reversed
}: {
  label: string;
  claim: string;
  reversed: boolean;
}) => {
  const safeText = getSafeText(claim);
  return (
    <ListItemInfo
      reversed={reversed}
      numberOfLines={2}
      label={label}
      value={safeText}
      accessibilityLabel={`${label} ${safeText}`}
    />
  );
};

/**
 * Component which renders an image type claim.
 * @param label - the label of the claim
 * @param uri - the claim image uri
 * @param width - the claim image width
 * @param height - the claim image height
 * @param reversed - whether the claim label is displayed before the value or not
 */
const ImageClaimItem = ({
  label,
  uri,
  width,
  height,
  reversed
}: {
  label: string;
  uri: string;
  width: number;
  height: number;
  reversed: boolean;
}) => (
  <ListItemInfo
    numberOfLines={2}
    label={label}
    accessibilityLabel={`${label}`}
    reversed={reversed}
    value={
      <Image
        source={{
          uri
        }}
        style={{
          width: 200,
          height: Math.ceil((200 * height) / width)
        }}
        resizeMode="contain"
      />
    }
  />
);

/**
 * Component which renders a date type claim with an optional icon and expiration badge.
 * @param label - the label of the claim
 * @param claim - the value of the claim
 * @param reversed - whether the claim label is displayed before the value or not
 */
const DateClaimItem = ({
  label,
  claim,
  expires = false,
  reversed
}: {
  label: string;
  claim: Date;
  expires?: boolean;
  reversed: boolean;
}) => {
  const value = claim.toLocaleDateString();
  const {t} = useTranslation(['wallet']);

  return (
    <ListItemInfo
      key={`${label}-${value}`}
      label={label}
      value={value}
      accessibilityLabel={`${label} ${value}`}
      reversed={reversed}
      endElement={
        expires
          ? {
              type: 'badge',
              componentProps:
                Date.now() > claim.getTime()
                  ? {
                      variant: 'error',
                      text: t('wallet:claims.generic.expired')
                    }
                  : {
                      variant: 'success',
                      text: t('wallet:claims.generic.valid')
                    }
            }
          : undefined
      }
    />
  );
};

/**
 * Component which renders a claim of unknown type with a placeholder.
 * @param label - the label of the claim
 * @param _claim - the claim value of unknown type. We are not interested in its value but it's needed for the exaustive type checking.
 * @param reversed - whether the claim label is displayed before the value or not
 */
const UnknownClaimItem = ({
  label,
  reversed
}: {
  label: string;
  reversed: boolean;
}) => (
  <PlainTextClaimItem
    label={label}
    claim={i18next.t('wallet:claims.generic.notAvailable')}
    reversed={reversed}
  />
);

/**
 * Component which renders a driving privileges type claim.
 * It features a bottom sheet with information about the issued and expiration date of the claim.
 * @param label the label of the claim
 * @param claim the claim value
 * @param detailsButtonVisible a flag to show or hide the details button
 * @param reversed - whether the claim label is displayed before the value or not
 * @returns a list item component with the driving privileges claim
 */
const DrivingPrivilegesClaimItem = ({
  label,
  claim,
  detailsButtonVisible = true,
  reversed
}: {
  label: string;
  claim: DrivingPrivilegesType['value'][0];
  detailsButtonVisible?: boolean;
  reversed: boolean;
}) => {
  const {issue_date, expiry_date, vehicle_category_code} = claim;
  const localIssueDate = new Date(issue_date).toLocaleDateString();
  const localExpiryDate = new Date(expiry_date).toLocaleDateString();
  const {t} = useTranslation(['wallet', 'global']);
  const privilegeBottomSheet = useIOBottomSheetModal({
    title: t('wallet:claims.mdl.license', {
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
          value={localExpiryDate}
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
        reversed={reversed}
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
  detailsButtonVisible = true,
  reversed
}: {
  label: string;
  claim: VerificationEvidenceType['value'];
  detailsButtonVisible: boolean;
  reversed: boolean;
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
        reversed={reversed}
      />
      {verificationBottomSheet.bottomSheet}
    </>
  );
};

/**
 * Component which renders a claim.
 * It renders a different component based on the type of the claim.
 * @param claim - the claim to render
 * @param reversed - whether the claim label is displayed before the value or not
 */
const CredentialClaim = ({
  claim,
  isPreview,
  reversed = false
}: {
  claim: ClaimDisplayFormat;
  isPreview: boolean;
  reversed?: boolean;
}) => {
  const decoded = claimScheme.safeParse(claim);
  /**
   * It seems like there's no way to get the type in typescript after the safeParse method is called inside the if statement.
   * Thus type casting is required.
   */
  if (decoded.success) {
    switch (decoded.data.type) {
      case 'date':
        return (
          <DateClaimItem
            reversed={reversed}
            label={claim.label}
            claim={decoded.data.value}
          />
        );
      case 'expireDate':
        return (
          <DateClaimItem
            label={claim.label}
            claim={decoded.data.value}
            expires={!isPreview}
            reversed={reversed}
          />
        );
      case 'drivingPrivileges':
        return (
          <>
            {decoded.data.value.map((elem, index) => (
              <Fragment
                key={`${index}_${claim.label}_${elem.vehicle_category_code}`}>
                {index !== 0 && <Divider />}
                <DrivingPrivilegesClaimItem
                  label={claim.label}
                  claim={elem}
                  detailsButtonVisible={!isPreview}
                  reversed={reversed}
                />
              </Fragment>
            ))}
          </>
        );
      case 'verificationEvidence':
        return (
          <VerificationEvidenceClaimItem
            label={claim.label}
            claim={decoded.data.value}
            detailsButtonVisible={!isPreview}
            reversed={reversed}
          />
        );
      case 'string':
        return (
          <PlainTextClaimItem
            label={claim.label}
            claim={decoded.data.value}
            reversed={reversed}
          />
        );
      case 'stringArray':
        return (
          <PlainTextClaimItem
            label={claim.label}
            claim={decoded.data.value.reduce((prev, str, idx) => prev + `${idx ? ', ': ''}${str}`, '')}
            reversed={reversed}
          />
        )
      case 'image':
        return (
          <ImageClaimItem
            label={claim.label}
            uri={decoded.data.value}
            width={decoded.data.width}
            height={decoded.data.height}
            reversed={reversed}
          />
        );
      default:
        return <UnknownClaimItem label={claim.label} reversed={reversed} />;
    }
  } else {
    return <UnknownClaimItem label={claim.label} reversed={reversed} />;
  }
};

const MemoizedCredentialClaim = memo(CredentialClaim);
export {MemoizedCredentialClaim as CredentialClaim};
