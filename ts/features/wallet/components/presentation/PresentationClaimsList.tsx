import {
  Divider,
  H6,
  IOColors,
  BodySmall,
  AnimatedCheckbox,
  ListItemHeader,
  VSpacer
} from '@pagopa/io-app-design-system';
import {StyleSheet, View} from 'react-native';
import React from 'react';
import i18next from 'i18next';
import {useTranslation} from 'react-i18next';
import {Descriptor, OptionalClaims} from '../../store/presentation';
import {ClaimDisplayFormat} from '../../utils/types';
import {getSafeText, isStringNullyOrEmpty} from '../../../../utils/string';
import {claimScheme, VerificationEvidenceType} from '../../utils/claims';

export type RequiredClaimsProps = {
  optionalChecked: Array<OptionalClaims>;
  setOptionalChecked: (encoded: OptionalClaims) => void;
  descriptor: Descriptor;
  source: string;
};

/**
 * Component that renders the list of required claims for a credential during the presentation.
 * @param descriptor - The descriptor of the credential
 * @param optionalChcked - The list of optional claims that the user has checked will be added to this list
 * @param setOptionalChecked - The function to set the optional claims that the user has checked
 * @param source - The source of the claim
 */
const PresentationClaimsList = ({
  descriptor,
  source,
  optionalChecked,
  setOptionalChecked
}: RequiredClaimsProps) => {
  const requiredDisclosures = descriptor.flatMap(
    item => item.requiredDisclosures
  );
  const optionalDisclosures = descriptor.flatMap(
    item => item.optionalDisclosures
  );

  const {t} = useTranslation(['wallet']);

  return (
    <>
      {requiredDisclosures.length > 0 && (
        <>
          <ListItemHeader
            label={t('wallet:presentation.trust.requiredClaims')}
            iconName="security"
            iconColor="grey-700"
          />
          <View style={styles.container}>
            {requiredDisclosures.map((claim, index) => (
              <View key={`${index}`}>
                {/* Add a separator view between sections */}
                {index !== 0 && <Divider />}
                <View style={styles.dataItem}>
                  <View style={styles.shrinked}>
                    <ClaimText
                      claim={{
                        id: claim.name,
                        label: claim.name,
                        value: claim.value
                      }}
                    />
                    <BodySmall weight="Regular" color="grey-700">
                      {source}
                    </BodySmall>
                  </View>
                  <AnimatedCheckbox size={24} checked={true} />
                </View>
              </View>
            ))}
          </View>
        </>
      )}
      {optionalDisclosures.length > 0 && (
        <>
          <VSpacer size={24} />
          <ListItemHeader
            label={t('wallet:presentation.trust.optionalClaims')}
            iconName="security"
            iconColor="grey-700"
          />
          <View style={styles.container}>
            {optionalDisclosures.map((claim, index) => (
              <View key={`${index}-${claim.name}`}>
                {/* Add a separator view between sections */}
                {index !== 0 && <Divider />}
                <View style={styles.dataItem}>
                  <View style={styles.shrinked}>
                    <ClaimText
                      claim={{
                        id: claim.name,
                        label: claim.name,
                        value: claim.value
                      }}
                    />
                    <BodySmall weight="Regular" color="grey-700">
                      {source}
                    </BodySmall>
                  </View>
                  <AnimatedCheckbox
                    size={24}
                    checked={optionalChecked.includes(claim)}
                    onPress={_ => setOptionalChecked(claim)}
                  />
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </>
  );
};

/**
 * Component which renders the claim value or multiple values in case of an array.
 * If the claim is an empty string or null, it will not render it.
 * @param claim The claim to render
 * @returns An {@link H6} element with the claim value or multiple {@link H6} elements in case of an array
 */
export const ClaimText = ({claim}: {claim: ClaimDisplayFormat}) => {
  const displayValue = getClaimDisplayValue(claim);
  return (
    <>
      {/* The empty fragment is need to avoid TSC error regarding the possible return of Element[] */}
      {Array.isArray(displayValue) ? (
        displayValue.map((value, index) => {
          const safeValue = getSafeText(value);
          return <H6 key={`${index}_${safeValue}`}>{safeValue}</H6>;
        })
      ) : isStringNullyOrEmpty(displayValue) ? null : ( // We want to exclude empty strings and null values
        <H6>{getSafeText(displayValue)}</H6>
      )}
    </>
  );
};

export const getClaimDisplayValue = (
  claim: ClaimDisplayFormat
): string | Array<string> => {
  const decoded = claimScheme.safeParse(claim);

  if (decoded.success) {
    switch (decoded.data.type) {
      case 'date':
      case 'expireDate':
        return decoded.data.value.toLocaleDateString();
      case 'drivingPrivileges':
        return decoded.data.value.map(elem => elem.vehicle_category_code);
      case 'verificationEvidence':
        return JSON.stringify(decoded.data as VerificationEvidenceType);
      case 'string':
        return getSafeText(decoded.data.value);
      // Rendering the image as its encoded version temporarily,
      // since this component may undergo significant changes
      case 'image':
        return decoded.data.value;
      default:
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
  },
  shrinked: {
    flexShrink: 1
  }
});

export default PresentationClaimsList;
