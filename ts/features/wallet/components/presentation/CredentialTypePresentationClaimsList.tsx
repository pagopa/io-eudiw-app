import { Dispatch, SetStateAction, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  AnimatedCheckbox,
  Divider,
  H4,
  IOColors,
  ListItemHeader
} from '@pagopa/io-app-design-system';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { getCredentialNameByType } from '../../utils/credentials';
import { getClaimsFullLocale } from '../../utils/locale';
import { CredentialClaim } from '../credential/CredentialClaims';
import { ClaimsSelector } from '../../../../components/ClaimsSelector';
import { ParsedCredential } from '../../utils/itwTypesUtils';

/**
 * This is the type definition for the accepted fields that will be presented to the verifier app.
 * It contains of a nested object structure, where the outermost key represents the credential doctype.
 * The inner dictionary contains namespaces, and for each namespace, there is another dictionary mapping requested claims to a boolean value,
 * which indicates whether the user is willing to present the corresponding claim. Example:
 * `{
 *    "org.iso.18013.5.1.mDL": {
 *      "org.iso.18013.5.1": {
 *        "hair_colour": true, // Indicates the user is willing to present this claim
 *        "given_name_national_character": true,
 *        "family_name_national_character": true,
 *        "given_name": true,
 *     }
 *    }
 *  }`
 * */
export type CredentialTypePresentationClaimsListOptionalAcceptedFields = {
  [credential: string]: {
    [namespace: string]: { [field: string]: boolean };
  };
};

export type CredentialTypePresentationClaimsListDescriptor = Record<
  string,
  Record<string, Record<string, ParsedCredential[string]>>
>;

/**
 * Conversion of the {@link CredentialTypePresentationClaimsListDescriptor} for internal usage inside of the
 * {@link CredentialTypePresentationClaimsList} component
 */
type DisclosuresViewModel = Record<string, Record<string, AttributeDescriptor>>;

type CredentialTypePresentationClaimsListProps = {
  mandatoryDescriptor?: CredentialTypePresentationClaimsListDescriptor;
  optionalSection?: {
    optionalDescriptor: CredentialTypePresentationClaimsListDescriptor;
    optionalCheckState: CredentialTypePresentationClaimsListOptionalAcceptedFields;
    setOptionalCheckState: Dispatch<
      SetStateAction<CredentialTypePresentationClaimsListOptionalAcceptedFields>
    >;
  };
  showMandatoryHeader?: boolean;
  showOptionalHeader?: boolean;
};

type AttributeDescriptor = {
  label: string;
  value: unknown;
  id: string;
  path: Array<string>;
};

type DescriptorTransform = (
  descriptor: CredentialTypePresentationClaimsListDescriptor
) => DisclosuresViewModel;
/**
 * Hook to transform a {@link CredentialTypePresentationClaimsListDescriptor} into the correctly rendered format
 */
const useTransformDescriptor: DescriptorTransform = descriptor =>
  useMemo(() => {
    const rawDisclosuresViewModel = _.mapValues(
      /**
       * For each credential type...
       */
      descriptor,
      (namespaces, credentialtype) =>
        _.mapValues(namespaces, (attributes, namespace) =>
          _.mapValues(attributes, (attribute, attributeName) => {
            const attributeLabel =
              typeof attribute.name === 'string'
                ? attribute.name
                : _.get(
                    attribute,
                    ['name', getClaimsFullLocale()],
                    attributeName
                  );

            const path = [credentialtype, namespace, attributeName];

            /**
             * We transform each attribute's parsed value into an {@link AttributeDescriptor} ...
             */
            return {
              label: attributeLabel,
              value: attribute.value,
              id: attributeName,
              path
            };
          })
        )
    );

    /**
     * Then we flatten the attributes of the namespaces (see function's javadoc)
     */
    const flattenedDisclosuresViewModel: Record<
      string,
      Record<string, AttributeDescriptor>
    > = _.mapValues(rawDisclosuresViewModel, namespaces =>
      _.reduce(namespaces, (acc, attributes) => ({ ...acc, ...attributes }), {})
    );

    /**
     * Finally, we remap the credentialTypes to their names
     */
    return _.mapKeys(flattenedDisclosuresViewModel, (_value, credentialtype) =>
      getCredentialNameByType(credentialtype)
    );
  }, [descriptor]);

/**
 * This component renders the requested disclosures in the format { credentialType : { namespace : { attr: data } } } by flattening the credential namespaces,
 * and manages a passed {@link CredentialTypePresentationClaimsListOptionalAcceptedFields} state which will then be used to finish the presentation
 * An example of namespace flattening :
 * Descriptor :
 * {
 *    credTypeA : {
 *      namespace1 : {
 *        attr1 : data
 *      },
 *      namespace2 : {
 *        attr2 : data
 *      }
 *    },
 *    credTypeB ; {
 *      namespace3 : {
 *        attr1 : data
 *      }
 *    }
 * }
 * Flattened :
 * {
 *    credTypeA : {
 *      attr1 : data,
 *      attr2 : data
 *    },
 *    credTypeB ; {
 *      attr1 : data
 *    }
 * }
 */
const CredentialTypePresentationClaimsList = ({
  mandatoryDescriptor,
  optionalSection,
  showMandatoryHeader = true,
  showOptionalHeader = true
}: CredentialTypePresentationClaimsListProps) => {
  const { t } = useTranslation();
  const mandatoryDisclosuresViewModel = useTransformDescriptor(
    mandatoryDescriptor ?? {}
  );
  const optionalDisclosuresViewModel = useTransformDescriptor(
    optionalSection ? optionalSection.optionalDescriptor : {}
  );

  return (
    <View>
      {Object.entries(mandatoryDisclosuresViewModel).length > 0 && (
        <>
          {showMandatoryHeader && (
            <ListItemHeader
              label={t('wallet:presentation.trust.requiredClaims')}
              iconName="security"
              iconColor="grey-700"
            />
          )}
          <View style={styles.container}>
            {Object.entries(mandatoryDisclosuresViewModel).map(
              ([entry, attributes]) => (
                <View key={entry} style={styles.credentialContainer}>
                  <ClaimsSelector header={<H4>{entry}</H4>} defaultOpen>
                    <View style={styles.claimContainer}>
                      {Object.values(attributes).map((value, index) => (
                        <View key={value.id}>
                          {index !== 0 && <Divider />}
                          <View style={styles.dataItem}>
                            <View style={styles.dataItemLeft}>
                              <CredentialClaim
                                isPreview={true}
                                claim={value}
                                reversed={true}
                              />
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  </ClaimsSelector>
                </View>
              )
            )}
          </View>
        </>
      )}
      {optionalSection &&
        Object.entries(optionalDisclosuresViewModel).length > 0 && (
          <>
            {showOptionalHeader && (
              <ListItemHeader
                label={t('wallet:presentation.trust.optionalClaims')}
                iconName="security"
                iconColor="grey-700"
              />
            )}
            <View style={styles.container}>
              {Object.entries(optionalDisclosuresViewModel).map(
                ([entry, attributes]) => (
                  <View key={entry} style={styles.credentialContainer}>
                    <ClaimsSelector header={<H4>{entry}</H4>} defaultOpen>
                      <View style={styles.claimContainer}>
                        {Object.values(attributes).map((value, index) => (
                          <View key={value.id}>
                            {index !== 0 && <Divider />}
                            <View style={styles.dataItem}>
                              <View style={styles.dataItemLeft}>
                                <CredentialClaim
                                  isPreview={true}
                                  claim={value}
                                  reversed={true}
                                />
                              </View>
                              <View style={styles.dataItemRight}>
                                <AnimatedCheckbox
                                  size={28}
                                  checked={_.get(
                                    optionalSection.optionalCheckState,
                                    value.path,
                                    false
                                  )}
                                  onPress={() => {
                                    /**
                                     * This toggle function inverts the value corresponding to the attribute in
                                     * the {@link AcceptedFields} checkState
                                     */
                                    const newState = _.cloneDeep(
                                      optionalSection.optionalCheckState
                                    );
                                    _.set(
                                      newState,
                                      value.path,
                                      !_.get(
                                        optionalSection.optionalCheckState,
                                        value.path
                                      )
                                    );
                                    optionalSection.setOptionalCheckState(
                                      newState
                                    );
                                  }}
                                />
                              </View>
                            </View>
                          </View>
                        ))}
                      </View>
                    </ClaimsSelector>
                  </View>
                )
              )}
            </View>
          </>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    gap: 20
  },
  credentialContainer: {
    backgroundColor: IOColors['grey-50'],
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 24
  },
  claimContainer: { paddingTop: 10 },
  dataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4
  },
  dataItemLeft: { flexGrow: 10 },
  dataItemRight: { flexGrow: 1, alignItems: 'flex-end' }
});

export default CredentialTypePresentationClaimsList;
