import React, {Dispatch, SetStateAction} from 'react';
import {StyleSheet, View} from 'react-native';
import {
  AnimatedCheckbox,
  Divider,
  H4,
  IOColors,
  RawAccordion
} from '@pagopa/io-app-design-system';
import {AcceptedFields} from '@pagopa/io-react-native-proximity';
import _ from 'lodash';
import {ProximityDisclosureDescriptor} from '../../store/proximity';
import {getCredentialNameByType} from '../../utils/credentials';
import {getClaimsFullLocale} from '../../utils/locale';
import {CredentialClaim} from '../credential/CredentialClaims';

type ProximityClaimsListProps = {
  descriptor: ProximityDisclosureDescriptor;
  checkState: AcceptedFields;
  setCheckState: Dispatch<SetStateAction<AcceptedFields>>;
};

type AttributeDescriptor = {
  label: string;
  value: unknown;
  id: string;
  toggle: () => void;
  active: boolean;
};

/**
 * This component renders the requested disclosures in the {@link ProximityDisclosureDescriptor} by flattening the credential namespaces,
 * and manages a passed {@link AcceptedFields} state which will then be presented to the verifier
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
const ProximityClaimsList = ({
  descriptor,
  checkState,
  setCheckState
}: ProximityClaimsListProps) => {
  const disclosuresViewModel: Record<
    string,
    Record<string, Record<string, AttributeDescriptor>>
  > = _.mapValues(
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
            /**
             * The toggle function inverts the value corresponding to the attribute in
             * the {@link AcceptedFields} checkState
             */
            toggle: () => {
              const newState = _.cloneDeep(checkState);
              _.set(newState, path, !_.get(checkState, path));
              setCheckState(newState);
            },
            active: _.get(checkState, path, false)
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
  > = _.mapValues(disclosuresViewModel, namespaces =>
    _.reduce(namespaces, (acc, attributes) => ({...acc, ...attributes}), {})
  );

  /**
   * Finally, we remap the credentialTypes to their names
   */
  const finalViewModel: Record<
    string,
    Record<string, AttributeDescriptor>
  > = _.mapKeys(flattenedDisclosuresViewModel, (_value, credentialtype) =>
    getCredentialNameByType(credentialtype)
  );

  return (
    <View style={styles.container}>
      {Object.entries(finalViewModel).map(([entry, attributes]) => (
        <View key={entry} style={styles.credentialContainer}>
          <RawAccordion header={<H4>{entry}</H4>}>
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
                        size={24}
                        checked={value.active}
                        onPress={value.toggle}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </RawAccordion>
        </View>
      ))}
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
  claimContainer: {paddingTop: 10},
  dataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4
  },
  dataItemLeft: {flexGrow: 10},
  dataItemRight: {flexGrow: 1, alignItems: 'flex-end'}
});

export default ProximityClaimsList;
