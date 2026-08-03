import {
  clipboardSetStringWithFeedback,
  getSafeText,
  useIOBottomSheetModal
} from '@io-eudiw-app/commons';
import { Divider, ListItemInfo } from '@pagopa/io-app-design-system';
import { t } from 'i18next';
import { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Image } from 'react-native';
import * as z from 'zod';

import {
  DrivingPrivilegesClaimType,
  ParsedClaimsRecord,
  PlaceOfBirthClaimType,
  verificationEvidenceSchema
} from '../../utils/claims';
import { HIDDEN_CLAIM_TEXT } from '../../utils/constants';
import { format } from '../../utils/dates';
import { ItwCredentialStatus } from '../../utils/itwTypesUtils';

/**
 * Helper function to get the accessibility text for hidden claims.
 * @returns the localized accessibility text for hidden claims
 */
const getHiddenClaimAccessibilityText = () =>
  t('presentation.credentialDetails.hiddenClaim', { ns: 'wallet' });

/**
 * Component which renders a place of birth type claim.
 * @param label - the label of the claim
 * @param claim - the claim value
 * @param hidden - a flag to hide the claim value
 */
const PlaceOfBirthClaimItem = ({
  claim,
  hidden,
  label,
  reversed
}: {
  claim: PlaceOfBirthClaimType;
  hidden?: boolean;
  label: string;
  reversed: boolean;
}) => {
  const displayValue = hidden ? HIDDEN_CLAIM_TEXT : claim.value;
  const accessibilityStateText = hidden
    ? getHiddenClaimAccessibilityText()
    : claim.value;

  return (
    <ListItemInfo
      accessibilityLabel={`${label} ${accessibilityStateText}`}
      label={label}
      reversed={reversed}
      value={displayValue}
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
  claim,
  hidden,
  label,
  reversed
}: {
  claim: boolean;
  hidden?: boolean;
  label: string;
  reversed: boolean;
}) => {
  const realValue = t(`presentation.credentialDetails.boolClaim.${claim}`, {
    ns: 'wallet'
  });
  const displayValue = hidden ? HIDDEN_CLAIM_TEXT : realValue;
  const accessibilityStateText = hidden
    ? getHiddenClaimAccessibilityText()
    : realValue;

  return (
    <ListItemInfo
      accessibilityLabel={`${label}: ${accessibilityStateText}`}
      label={label}
      reversed={reversed}
      value={displayValue}
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
  claim,
  clipboardSuccessMessage,
  hidden,
  isCopyable,
  label,
  reversed
}: {
  claim: string;
  clipboardSuccessMessage: string;
  hidden?: boolean;
  isCopyable?: boolean;
  label: string;
  reversed: boolean;
}) => {
  const safeValue = getSafeText(claim);
  const displayValue = hidden ? HIDDEN_CLAIM_TEXT : safeValue;
  const accessibilityStateText = hidden
    ? getHiddenClaimAccessibilityText()
    : safeValue;

  const handleLongPress = async () => {
    await clipboardSetStringWithFeedback(safeValue, clipboardSuccessMessage);
  };

  return (
    <ListItemInfo
      accessibilityLabel={`${label} ${accessibilityStateText}`}
      label={label}
      numberOfLines={4}
      onLongPress={isCopyable && !hidden ? handleLongPress : undefined}
      reversed={reversed}
      value={displayValue}
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
  claim,
  hidden,
  label,
  reversed,
  status
}: {
  claim: Date;
  hidden?: boolean;
  label: string;
  reversed: boolean;
  status?: ItwCredentialStatus;
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
      case 'expired':
        return {
          componentProps: {
            text: t(`${ns}.expired`, { ns: 'wallet' }),
            variant: 'error'
          },
          type: 'badge'
        };
      case 'expiring':
      case 'jwtExpiring':
      case 'valid':
        return {
          componentProps: {
            text: t(`${ns}.valid`, { ns: 'wallet' }),
            variant: 'success'
          },
          type: 'badge'
        };
      case 'invalid':
        return {
          componentProps: {
            text: t(`${ns}.invalid`, { ns: 'wallet' }),
            variant: 'error'
          },
          type: 'badge'
        };
      default:
        return undefined;
    }
  }, [status, hidden]);

  return (
    <ListItemInfo
      accessibilityLabel={`${label} ${accessibilityStateText}`}
      endElement={endElement}
      key={`${label}-${displayValue}`}
      label={label}
      reversed={reversed}
      value={displayValue}
    />
  );
};

/**
 * Component which renders a claim of unknown type with a placeholder.
 * @param label - the label of the claim
 * @param _claim - the claim value of unknown type. We are not interested in its value but it's needed for the exaustive type checking.
 */
const UnknownClaimItem = ({
  clipboardSuccessMessage,
  label,
  reversed
}: {
  _claim?: unknown;
  clipboardSuccessMessage: string;
  label: string;
  reversed: boolean;
}) => (
  <PlainTextClaimItem
    claim={t('verifiableCredentials.generic.placeholders.claimNotAvailable', {
      ns: 'wallet'
    })}
    clipboardSuccessMessage={clipboardSuccessMessage}
    label={label}
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
  claim,
  clipboardSuccessMessage,
  height,
  hidden,
  label,
  reversed,
  width
}: {
  claim: string;
  clipboardSuccessMessage: string;
  height: number;
  hidden?: boolean;
  label: string;
  reversed: boolean;
  width: number;
}) =>
  hidden ? (
    <PlainTextClaimItem
      claim=""
      clipboardSuccessMessage={clipboardSuccessMessage}
      hidden
      label={label}
      reversed={reversed}
    />
  ) : (
    <ListItemInfo
      accessibilityLabel={label}
      accessibilityRole="image"
      label={label}
      reversed={reversed}
      value={
        <Image
          accessibilityIgnoresInvertColors
          resizeMode="contain"
          source={{ uri: claim }}
          style={{
            height: Math.ceil((200 * height) / width),
            width: 200
          }}
        />
      }
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
  claim,
  detailsButtonVisible,
  hidden,
  label,
  reversed,
  showLabel
}: {
  claim: DrivingPrivilegesClaimType['value'][0];
  detailsButtonVisible?: boolean;
  hidden?: boolean;
  label: string;
  reversed: boolean;
  showLabel: string;
}) => {
  const privilegeBottomSheet = useIOBottomSheetModal({
    closeAccessibilityLabel: t('buttons.close', { ns: 'common' }),
    component: (
      <>
        <ListItemInfo
          accessibilityLabel={`${t(
            'verifiableCredentials.claims.mdl.issuedDate',
            {
              ns: 'wallet'
            }
          )} ${claim.issue_date}`}
          label={t('verifiableCredentials.claims.mdl.issuedDate', {
            ns: 'wallet'
          })}
          reversed={reversed}
          value={format(claim.issue_date, 'DD/MM/YYYY')}
        />
        <Divider />
        <ListItemInfo
          accessibilityLabel={`${t(
            'verifiableCredentials.claims.mdl.expirationDate',
            {
              ns: 'wallet'
            }
          )} ${claim.expiry_date}`}
          label={t('verifiableCredentials.claims.mdl.expirationDate', {
            ns: 'wallet'
          })}
          reversed={reversed}
          value={format(claim.expiry_date, 'DD/MM/YYYY')}
        />
      </>
    ),
    title: t('verifiableCredentials.claims.mdl.category', {
      category: claim.vehicle_category_code,
      ns: 'wallet'
    })
  });

  const realValue = claim.vehicle_category_code;
  const displayValue = hidden ? HIDDEN_CLAIM_TEXT : realValue;
  const accessibilityStateText = hidden
    ? getHiddenClaimAccessibilityText()
    : realValue;

  const endElement: ListItemInfo['endElement'] =
    detailsButtonVisible && !hidden
      ? {
          componentProps: {
            accessibilityLabel: showLabel,
            label: showLabel,
            onPress: () => privilegeBottomSheet.present()
          },
          type: 'buttonLink'
        }
      : undefined;

  return (
    <>
      <ListItemInfo
        accessibilityLabel={`${label} ${accessibilityStateText}`}
        endElement={endElement}
        label={label}
        reversed={reversed}
        value={displayValue}
      />
      {privilegeBottomSheet.bottomSheet}
    </>
  );
};

type VerificationEvidenceClaimType = z.infer<typeof verificationEvidenceSchema>;

/**
 * Component which renders a verification evidence type claim.
 * It features a bottom sheet with information about the organization id, name and country code.
 */
const VerificationEvidenceClaimItem = ({
  claim,
  detailsButtonVisible = true,
  label,
  reversed
}: {
  claim: VerificationEvidenceClaimType['value'];
  detailsButtonVisible: boolean;
  label: string;
  reversed: boolean;
}) => {
  const { country_code, organization_id, organization_name } = claim;
  const { t } = useTranslation(['wallet', 'common']);
  const verificationBottomSheet = useIOBottomSheetModal({
    closeAccessibilityLabel: t('buttons.close', { ns: 'common' }),
    component: (
      <>
        <ListItemInfo
          accessibilityLabel={`${t(
            'verifiableCredentials.claims.mdl.verificationEvidence.organizationId'
          )} ${organization_id}`}
          label={t(
            'verifiableCredentials.claims.mdl.verificationEvidence.organizationId'
          )}
          value={organization_id}
        />
        <Divider />
        <ListItemInfo
          accessibilityLabel={`${t(
            'verifiableCredentials.claims.mdl.verificationEvidence.countryCode'
          )} ${country_code}`}
          label={t(
            'verifiableCredentials.claims.mdl.verificationEvidence.countryCode'
          )}
          value={country_code}
        />
      </>
    ),
    title: organization_name
  });

  const endElement: ListItemInfo['endElement'] = detailsButtonVisible
    ? {
        componentProps: {
          accessibilityLabel: t('common:buttons.show'),
          label: t('common:buttons.show'),
          onPress: () => verificationBottomSheet.present()
        },
        type: 'buttonLink'
      }
    : undefined;

  return (
    <>
      <ListItemInfo
        accessibilityLabel={`${label} ${organization_name}`}
        endElement={endElement}
        label={label}
        reversed={reversed}
        value={organization_name}
      />
      {verificationBottomSheet.bottomSheet}
    </>
  );
};

/**
 * Component which renders a claim.
 * It renders a different component based on the type of the claim.
 * @param claim - the claim to render
 * @param clipboardSuccessMessage - the message to show when the claim value is copied to the clipboard
 * @param showLabel - the label to show for the details button of some claim types
 * @param hidden - a flag to hide the claim value
 * @param isPreview - a flag to indicate if the claim is being rendered in preview mode
 * @param credentialStatus - the status of the credential, used for expiration date claims
 * @param credentialType - the type of the credential, used for analytics tracking
 */
export const ItwCredentialClaim = ({
  claim,
  clipboardSuccessMessage,
  credentialStatus,
  hidden,
  isPreview,
  reversed = false,
  showLabel
}: {
  claim: ParsedClaimsRecord[string];
  clipboardSuccessMessage: string;
  credentialStatus?: ItwCredentialStatus;
  hidden?: boolean;
  isPreview?: boolean;
  reversed?: boolean;
  showLabel: string;
}) => {
  if (claim.parsed) {
    switch (claim.parsed.type) {
      case 'boolean':
        return (
          <BoolClaimItem
            claim={claim.parsed.value}
            hidden={hidden}
            label={claim.label}
            reversed={reversed}
          />
        );
      case 'date':
        return (
          <DateClaimItem
            claim={claim.parsed.value}
            hidden={hidden}
            label={claim.label}
            reversed={reversed}
          />
        );
      case 'drivingPrivileges':
        return claim.parsed.value.map((elem, index) => (
          <Fragment
            key={`${index}_${claim.label}_${elem.vehicle_category_code}`}
          >
            {index !== 0 && <Divider />}
            <DrivingPrivilegesClaimItem
              claim={elem}
              detailsButtonVisible={!isPreview}
              hidden={hidden}
              label={claim.label}
              reversed={reversed}
              showLabel={showLabel}
            />
          </Fragment>
        ));
      case 'emptyString':
        return null; // We want to hide the claim if it's empty
      case 'expireDate':
        return (
          <DateClaimItem
            claim={claim.parsed.value}
            hidden={hidden}
            label={claim.label}
            reversed={reversed}
            status={!isPreview ? credentialStatus : undefined}
          />
        );
      case 'image':
        return (
          <ImageClaimItem
            claim={claim.parsed.value}
            clipboardSuccessMessage={clipboardSuccessMessage}
            height={claim.parsed.height}
            hidden={hidden}
            label={claim.label}
            reversed={reversed}
            width={claim.parsed.width}
          />
        );
      case 'placeOfBirth':
        return (
          <PlaceOfBirthClaimItem
            claim={claim.parsed}
            hidden={hidden}
            label={claim.label}
            reversed={reversed}
          />
        );
      case 'string':
        return (
          <PlainTextClaimItem
            claim={claim.parsed.value}
            clipboardSuccessMessage={clipboardSuccessMessage}
            hidden={hidden}
            isCopyable={!isPreview}
            label={claim.label}
            reversed={reversed}
          />
        ); // must be the last one to be checked due to overlap with IPatternStringTag
      case 'stringArray':
        return (
          <PlainTextClaimItem
            claim={claim.parsed.value.join(', ')}
            clipboardSuccessMessage={clipboardSuccessMessage}
            hidden={hidden}
            label={claim.label}
            reversed={reversed}
          />
        );
      case 'verification':
        return (
          <PlainTextClaimItem
            claim={claim.parsed.value}
            clipboardSuccessMessage={clipboardSuccessMessage}
            label={claim.label}
            reversed={false}
          />
        );
      case 'verificationEvidence':
        return (
          <VerificationEvidenceClaimItem
            claim={claim.parsed.value}
            detailsButtonVisible={!isPreview}
            label={claim.label}
            reversed={reversed}
          />
        );
    }
  }
  return (
    <UnknownClaimItem
      _claim={claim}
      clipboardSuccessMessage={clipboardSuccessMessage}
      label={claim.label}
      reversed={reversed}
    />
  );
};
