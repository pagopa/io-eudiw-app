import { Divider, ListItemInfo } from '@pagopa/io-app-design-system';
import { Fragment, useMemo } from 'react';
import { Image } from 'react-native';
import I18n from 'i18next';
import z from 'zod';
import { useTranslation } from 'react-i18next';
import {
  claimScheme,
  DrivingPrivilegesClaimType,
  PlaceOfBirthClaimType,
  verificationEvidenceSchema
} from '../../utils/claims';
import { HIDDEN_CLAIM_TEXT } from '../../utils/constants';
import { getSafeText } from '../../../../utils/string';
import { clipboardSetStringWithFeedback } from '../../../../utils/clipboard';
import { ItwCredentialStatus } from '../../utils/itwTypesUtils';
import { useIOBottomSheetModal } from '../../../../hooks/useBottomSheet';
import { ClaimDisplayFormat } from '../../utils/types';

/**
 * Helper function to get the accessibility text for hidden claims.
 * @returns the localized accessibility text for hidden claims
 */
const getHiddenClaimAccessibilityText = () =>
  I18n.t('presentation.credentialDetails.hiddenClaim', { ns: 'wallet' });

/**
 * Component which renders a place of birth type claim.
 * @param label - the label of the claim
 * @param claim - the claim value
 * @param hidden - a flag to hide the claim value
 */
const PlaceOfBirthClaimItem = ({
  label,
  claim,
  hidden,
  reversed
}: {
  label: string;
  claim: PlaceOfBirthClaimType;
  hidden?: boolean;
  reversed: boolean;
}) => {
  const realValue = `${claim.value.locality} (${claim.value.country})`;
  const displayValue = hidden ? HIDDEN_CLAIM_TEXT : realValue;
  const accessibilityStateText = hidden
    ? getHiddenClaimAccessibilityText()
    : realValue;

  return (
    <ListItemInfo
      label={label}
      value={displayValue}
      accessibilityLabel={`${label} ${accessibilityStateText}`}
      reversed={reversed}
    />
  );
};

/**
 * Component which renders a yes/no claim.
 * @param label - the label of the claim
 * @param claim - the claim value
 * @param hidden - a flag to hide the claim value
 */
const BoolClaimItem = ({
  label,
  claim,
  hidden,
  reversed
}: {
  label: string;
  claim: boolean;
  hidden?: boolean;
  reversed: boolean;
}) => {
  const realValue = I18n.t(
    `presentation.credentialDetails.boolClaim.${claim}`,
    { ns: 'wallet' }
  );
  const displayValue = hidden ? HIDDEN_CLAIM_TEXT : realValue;
  const accessibilityStateText = hidden
    ? getHiddenClaimAccessibilityText()
    : realValue;

  return (
    <ListItemInfo
      label={label}
      value={displayValue}
      accessibilityLabel={`${label}: ${accessibilityStateText}`}
      reversed={reversed}
    />
  );
};

/**
 * Component which renders a generic text type claim.
 * @param label - the label of the claim
 * @param claim - the claim value
 * @param isCopyable - a flag to enable the copy of the claim value
 * @param credentialType - the type of the credential, used for analytics tracking
 * @param hidden - a flag to hide the claim value
 */
const PlainTextClaimItem = ({
  label,
  claim,
  isCopyable,
  hidden,
  reversed
}: {
  label: string;
  claim: string;
  isCopyable?: boolean;
  hidden?: boolean;
  reversed: boolean;
}) => {
  const safeValue = getSafeText(claim);
  const displayValue = hidden ? HIDDEN_CLAIM_TEXT : safeValue;
  const accessibilityStateText = hidden
    ? getHiddenClaimAccessibilityText()
    : safeValue;

  const handleLongPress = () => {
    clipboardSetStringWithFeedback(safeValue);
  };

  return (
    <ListItemInfo
      numberOfLines={4}
      label={label}
      value={displayValue}
      onLongPress={isCopyable && !hidden ? handleLongPress : undefined}
      accessibilityLabel={`${label} ${accessibilityStateText}`}
      reversed={reversed}
    />
  );
};

/**
 * Component which renders a date type claim with an optional icon and expiration badge.
 * @param label - the label of the claim
 * @param claim - the value of the claim
 * @param status - the status of the claim, used to show an expiration badge
 * @param hidden - a flag to hide the claim value
 */
const DateClaimItem = ({
  label,
  claim,
  status,
  hidden,
  reversed
}: {
  label: string;
  claim: Date;
  status?: ItwCredentialStatus;
  hidden?: boolean;
  reversed: boolean;
}) => {
  // Remove the timezone offset to display the date in its original format
  const realValue = claim.toLocaleDateString();
  const displayValue = hidden ? HIDDEN_CLAIM_TEXT : realValue;
  const accessibilityStateText = hidden
    ? getHiddenClaimAccessibilityText()
    : realValue;

  const endElement: ListItemInfo['endElement'] = useMemo(() => {
    if (hidden) {
      return undefined;
    }
    const ns = 'presentation.credentialDetails.status';
    switch (status) {
      case 'valid':
      case 'expiring':
      case 'jwtExpiring':
        return {
          type: 'badge',
          componentProps: {
            variant: 'success',
            text: I18n.t(`${ns}.valid`, { ns: 'wallet' })
          }
        };
      case 'expired':
        return {
          type: 'badge',
          componentProps: {
            variant: 'error',
            text: I18n.t(`${ns}.expired`, { ns: 'wallet' })
          }
        };
      case 'invalid':
        return {
          type: 'badge',
          componentProps: {
            variant: 'error',
            text: I18n.t(`${ns}.invalid`, { ns: 'wallet' })
          }
        };
      default:
        return undefined;
    }
  }, [status, hidden]);

  return (
    <ListItemInfo
      key={`${label}-${displayValue}`}
      label={label}
      value={displayValue}
      accessibilityLabel={`${label} ${accessibilityStateText}`}
      endElement={endElement}
      reversed={reversed}
    />
  );
};

/**
 * Component which renders a claim of unknown type with a placeholder.
 * @param label - the label of the claim
 * @param _claim - the claim value of unknown type. We are not interested in its value but it's needed for the exaustive type checking.
 */
const UnknownClaimItem = ({
  label,
  reversed
}: {
  label: string;
  _claim?: unknown;
  reversed: boolean;
}) => (
  <PlainTextClaimItem
    label={label}
    claim={I18n.t(
      'verifiableCredentials.generic.placeholders.claimNotAvailable',
      { ns: 'wallet' }
    )}
    reversed={reversed}
  />
);

/**
 * Component which renders a image type claim in a square container.
 * @param label - the label of the claim
 * @param claim - the claim value
 * @param hidden - a flag to hide the claim value
 */
const ImageClaimItem = ({
  label,
  claim,
  hidden,
  reversed
}: {
  label: string;
  claim: string;
  hidden?: boolean;
  reversed: boolean;
}) =>
  hidden ? (
    <PlainTextClaimItem label={label} claim="" hidden reversed={reversed} />
  ) : (
    <ListItemInfo
      label={label}
      value={
        <Image
          source={{ uri: claim }}
          style={{
            width: 200,
            aspectRatio: 3 / 4
          }}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      }
      accessibilityLabel={label}
      accessibilityRole="image"
      reversed={reversed}
    />
  );

/**
 * Component which renders an attachment claim
 * @param name - name of the file
 * @param hidden - a flag to hide the claim value
 */
const AttachmentsClaimItem = ({
  name,
  hidden,
  reversed
}: {
  name: string;
  hidden?: boolean;
  reversed: boolean;
}) =>
  hidden ? (
    <PlainTextClaimItem
      label={I18n.t('verifiableCredentials.claims.attachments', {
        ns: 'wallet'
      })}
      claim=""
      hidden
      reversed={reversed}
    />
  ) : (
    <ListItemInfo
      label={I18n.t('verifiableCredentials.claims.attachments', {
        ns: 'wallet'
      })}
      value={name}
      accessibilityLabel={`${I18n.t(
        'verifiableCredentials.claims.attachments',
        { ns: 'wallet' }
      )}: ${name}`}
      endElement={{
        type: 'badge',
        componentProps: {
          variant: 'default',
          text: 'PDF'
        }
      }}
      reversed={reversed}
    />
  );

/**
 * Component which renders a driving privileges type claim.
 * It features a bottom sheet with information about the issued and expiration date of the claim.
 * @param label the label of the claim
 * @param claim the claim value
 * @param detailsButtonVisible a flag to show or hide the details button
 * @param hidden a flag to hide the claim value
 * @returns a list item component with the driving privileges claim
 */
const DrivingPrivilegesClaimItem = ({
  label,
  claim,
  detailsButtonVisible,
  hidden,
  reversed
}: {
  label: string;
  claim: DrivingPrivilegesClaimType['value'][0];
  detailsButtonVisible?: boolean;
  hidden?: boolean;
  reversed: boolean;
}) => {
  const privilegeBottomSheet = useIOBottomSheetModal({
    title: I18n.t('verifiableCredentials.claims.mdl.category', {
      ns: 'wallet',
      category: claim.vehicle_category_code
    }),
    component: (
      <>
        <ListItemInfo
          label={I18n.t('verifiableCredentials.claims.mdl.issuedDate', {
            ns: 'wallet'
          })}
          value={claim.issue_date}
          accessibilityLabel={`${I18n.t(
            'verifiableCredentials.claims.mdl.issuedDate',
            {
              ns: 'wallet'
            }
          )} ${claim.issue_date}`}
          reversed={reversed}
        />
        <Divider />
        <ListItemInfo
          label={I18n.t('verifiableCredentials.claims.mdl.expirationDate', {
            ns: 'wallet'
          })}
          value={claim.expiry_date}
          accessibilityLabel={`${I18n.t(
            'verifiableCredentials.claims.mdl.expirationDate',
            {
              ns: 'wallet'
            }
          )} ${claim.expiry_date}`}
          reversed={reversed}
        />
        {/* claim.restrictions_conditions && (
          <>
            <Divider />
            <ListItemInfo
              label={I18n.t(
                "features.itWallet.verifiableCredentials.claims.mdl.restrictionConditions"
              )}
              value={claim.restrictions_conditions}
              accessibilityLabel={`${I18n.t(
                "features.itWallet.verifiableCredentials.claims.mdl.restrictionConditions"
              )} ${claim.restrictions_conditions}`}
            />
          </>
        ) */}
      </>
    )
  });

  const realValue = claim.vehicle_category_code;
  const displayValue = hidden ? HIDDEN_CLAIM_TEXT : realValue;
  const accessibilityStateText = hidden
    ? getHiddenClaimAccessibilityText()
    : realValue;

  const endElement: ListItemInfo['endElement'] =
    detailsButtonVisible && !hidden
      ? {
          type: 'buttonLink',
          componentProps: {
            label: I18n.t('buttons.show', { ns: 'global' }),
            onPress: () => privilegeBottomSheet.present(),
            accessibilityLabel: I18n.t('buttons.show', { ns: 'global' })
          }
        }
      : undefined;

  return (
    <>
      <ListItemInfo
        label={label}
        value={displayValue}
        endElement={endElement}
        accessibilityLabel={`${label} ${accessibilityStateText}`}
        reversed={reversed}
      />
      {privilegeBottomSheet.bottomSheet}
    </>
  );
};

export type VerificationEvidenceClaimType = z.infer<
  typeof verificationEvidenceSchema
>;

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
  claim: VerificationEvidenceClaimType['value'];
  detailsButtonVisible: boolean;
  reversed: boolean;
}) => {
  const { organization_id, organization_name, country_code } = claim;
  const { t } = useTranslation(['wallet', 'global']);
  const verificationBottomSheet = useIOBottomSheetModal({
    title: organization_name,
    component: (
      <>
        <ListItemInfo
          label={t(
            'wallet:verifiableCredentials.claims.mdl.verificationEvidence.organizationId'
          )}
          value={organization_id}
          accessibilityLabel={`${t(
            'wallet:verifiableCredentials.claims.mdl.verificationEvidence.organizationId'
          )} ${organization_id}`}
        />
        <Divider />
        <ListItemInfo
          label={t(
            'wallet:verifiableCredentials.claims.mdl.verificationEvidence.countryCode'
          )}
          value={country_code}
          accessibilityLabel={`${t(
            'wallet:verifiableCredentials.claims.mdl.verificationEvidence.countryCode'
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
 * @param hidden - a flag to hide the claim value
 * @param isPreview - a flag to indicate if the claim is being rendered in preview mode
 * @param credentialStatus - the status of the credential, used for expiration date claims
 * @param credentialType - the type of the credential, used for analytics tracking
 */
export const ItwCredentialClaim = ({
  claim,
  hidden,
  isPreview,
  credentialStatus,
  reversed = false
}: {
  claim: ClaimDisplayFormat;
  hidden?: boolean;
  isPreview?: boolean;
  credentialStatus?: ItwCredentialStatus;
  reversed?: boolean;
}) => {
  const decoded = claimScheme.safeParse(claim);

  if (decoded.success) {
    switch (decoded.data.type) {
      case 'placeOfBirth':
        return (
          <PlaceOfBirthClaimItem
            label={claim.label}
            claim={decoded.data}
            hidden={hidden}
            reversed={reversed}
          />
        );
      case 'date':
        return (
          <DateClaimItem
            label={claim.label}
            claim={decoded.data.value}
            hidden={hidden}
            reversed={reversed}
          />
        );
      case 'expireDate':
        return (
          <DateClaimItem
            label={claim.label}
            claim={decoded.data.value}
            hidden={hidden}
            status={!isPreview ? credentialStatus : undefined}
            reversed={reversed}
          />
        );
      case 'image':
        return (
          <ImageClaimItem
            label={claim.label}
            claim={decoded.data.value}
            hidden={hidden}
            reversed={reversed}
          />
        );
      case 'application/pdf':
        return (
          <AttachmentsClaimItem
            name={claim.label}
            hidden={hidden}
            reversed={reversed}
          />
        );
      case 'drivingPrivileges':
        return decoded.data.value.map((elem, index) => (
          <Fragment
            key={`${index}_${claim.label}_${elem.vehicle_category_code}`}
          >
            {index !== 0 && <Divider />}
            <DrivingPrivilegesClaimItem
              label={claim.label}
              claim={elem}
              detailsButtonVisible={!isPreview}
              hidden={hidden}
              reversed={reversed}
            />
          </Fragment>
        ));
      case 'boolean':
        return (
          <BoolClaimItem
            label={claim.label}
            claim={decoded.data.value}
            hidden={hidden}
            reversed={reversed}
          />
        );
      case 'stringArray':
        return (
          <PlainTextClaimItem
            label={claim.label}
            claim={decoded.data.value.join(', ')}
            hidden={hidden}
            reversed={reversed}
          />
        );
      case 'emptyString':
        return null; // We want to hide the claim if it's empty
      case 'string':
        return (
          <PlainTextClaimItem
            label={claim.label}
            claim={decoded.data.value}
            isCopyable={!isPreview}
            hidden={hidden}
            reversed={reversed}
          />
        ); // must be the last one to be checked due to overlap with IPatternStringTag
      case 'verificationEvidence':
        return (
          <VerificationEvidenceClaimItem
            label={claim.label}
            claim={decoded.data.value}
            detailsButtonVisible={!isPreview}
            reversed={reversed}
          />
        );
    }
  }
  return (
    <UnknownClaimItem
      label={claim.label}
      _claim={decoded}
      reversed={reversed}
    />
  );
};
