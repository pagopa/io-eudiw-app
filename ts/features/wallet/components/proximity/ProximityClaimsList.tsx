import React, {Dispatch, SetStateAction, useMemo} from 'react';
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
  path : Array<string>;
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
        Record<string, AttributeDescriptor>
  > = useMemo(() => {
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
        _.reduce(namespaces, (acc, attributes) => ({...acc, ...attributes}), {})
      );

      /**
      * Finally, we remap the credentialTypes to their names
      */
      return _.mapKeys(flattenedDisclosuresViewModel, (_value, credentialtype) =>
        getCredentialNameByType(credentialtype)
      );
  }, [descriptor]); 

  return (
    <View style={styles.container}>
      {Object.entries(disclosuresViewModel).map(([entry, attributes]) => (
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
                        size={28}
                        checked={_.get(checkState, value.path, false)}
                        onPress={() => {
                          /**
                           * This toggle function inverts the value corresponding to the attribute in
                           * the {@link AcceptedFields} checkState
                           */
                          const newState = _.cloneDeep(checkState);
                          _.set(newState, value.path, !_.get(checkState, value.path));
                          setCheckState(newState);
                        }}
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
