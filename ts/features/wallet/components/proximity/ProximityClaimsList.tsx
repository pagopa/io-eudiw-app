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
import {ProximityDisclosureDescriptor} from '../../store/proximity';
import {getCredentialNameByType} from '../../utils/credentials';
import {getClaimsFullLocale} from '../../utils/locale';
import {CredentialClaim} from '../credential/CredentialClaims';

type ProximityClaimsListProps = {
  descriptor: ProximityDisclosureDescriptor;
  checkState: AcceptedFields;
  setCheckState: Dispatch<SetStateAction<AcceptedFields>>;
};

const ProximityClaimsList = ({
  descriptor,
  checkState,
  setCheckState
}: ProximityClaimsListProps) => {
  const disclosuresViewModel = Object.fromEntries(
    Object.entries(descriptor).map(([credentialtype, namespaces]) => [
      getCredentialNameByType(credentialtype),
      Object.fromEntries(
        Object.entries(namespaces).flatMap(([namespace, attributes]) =>
          Object.entries(attributes).map(([attributeName, attribute]) => {
            const attributeLabel =
              typeof attribute.name === 'string'
                ? attribute.name
                : attribute.name?.[getClaimsFullLocale()] || attributeName;

            return [
              attributeName,
              {
                label: attributeLabel,
                value: attribute.value,
                id: attributeName,
                toggle: () => {
                  const invertedValue =
                    !checkState[credentialtype][namespace][attributeName];
                  const newNamespace = {
                    ...checkState[credentialtype][namespace],
                    [attributeName]: invertedValue
                  };
                  const newCredentialType = {
                    ...checkState[credentialtype],
                    [namespace]: newNamespace
                  };
                  setCheckState({
                    ...checkState,
                    [credentialtype]: newCredentialType
                  });
                },
                active: checkState[credentialtype][namespace][attributeName]
              }
            ];
          })
        )
      )
    ])
  );

  return (
    <View style={styles.container}>
      {Object.entries(disclosuresViewModel).map(([entry, attributes]) => (
        <View key={entry} style={styles.credentialContainer}>
          <RawAccordion
            header={<H4>{entry}</H4>}
            headerStyle={{paddingBottom: 16}}>
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
