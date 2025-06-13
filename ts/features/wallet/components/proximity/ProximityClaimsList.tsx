import React, { Dispatch, SetStateAction } from "react"
import { ProximityDisclosureDescriptor } from "../../store/proximity"
import { getCredentialNameByType } from "../../utils/credentials"
import { getClaimsFullLocale } from "../../utils/locale"
import { StyleSheet, View } from "react-native"
import { AnimatedCheckbox, Divider, H3, IOColors } from "@pagopa/io-app-design-system"
import { AcceptedFields } from "@pagopa/io-react-native-proximity"
import { CredentialClaim } from "../credential/CredentialClaims"

type ProximityClaimsListProps = {
    descriptor : ProximityDisclosureDescriptor,
    checkState : AcceptedFields,
    setCheckState : Dispatch<SetStateAction<AcceptedFields>>
}

const ProximityClaimsList = ({descriptor, checkState, setCheckState} : ProximityClaimsListProps) => {

  const disclosuresViewModel = Object.fromEntries(
    Object.entries(descriptor).map(([credentialtype, namespaces]) => {
      return [
        getCredentialNameByType(credentialtype),
        Object.fromEntries(
          Object.entries(namespaces).flatMap(([namespace, attributes]) => {
            return Object.entries(attributes).map(([attributeName, attribute]) => {
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
                    toggle : () => {
                      const checkStateCopy = Object.assign({}, checkState)
                      checkStateCopy[credentialtype][namespace][attributeName] = !checkState[credentialtype][namespace][attributeName]
                      setCheckState(checkStateCopy)
                    },
                    active : checkState[credentialtype][namespace][attributeName]
                  }
                ];
            })
          })
        )
      ]
    })
  )

  return (
    <View style={styles.container}>
      {
        Object.entries(disclosuresViewModel).map(([entry, attributes]) => 
          <View key={entry} style={styles.credentialContainer}>
            <H3>
              {entry}
            </H3>
            <View style={styles.claimContainer}>
              {Object.values(attributes).map((value, index) => <View key={value.id}>
                  {index !== 0 && <Divider />}
                  <View style={styles.dataItem}>
                    <View style={styles.dataItemLeft}>
                      <CredentialClaim
                        isPreview={true} 
                        claim={value}
                      />
                    </View>
                    <View style={styles.dataItemRight}>
                      <AnimatedCheckbox
                        checked={value.active}
                        onPress={value.toggle}
                      />
                    </View>
                  </View>
              </View>
              )}
            </View>
          </View>
        )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display : 'flex',
    gap : 40
  },
  credentialContainer: {
    backgroundColor: IOColors['grey-50'],
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical : 24
  },
  claimContainer : {paddingLeft : 24, paddingTop : 10},
  dataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dataItemLeft : {flexGrow : 10},
  dataItemRight : {flexGrow : 1, alignItems : 'flex-end'},
  shrinked: {
    flexShrink: 1
  }
});

export default ProximityClaimsList