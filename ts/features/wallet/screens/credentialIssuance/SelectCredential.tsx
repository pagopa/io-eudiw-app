import * as React from 'react';
import { StyleSheet, View } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { IOIcons, IOVisualCostants, ListItemHeader, ModuleCredential, VStack } from '@pagopa/io-app-design-system';
import { useTranslation } from 'react-i18next';
import { useHeaderSecondLevel } from '../../../../hooks/useHeaderSecondLevel';
import { IOScrollViewWithLargeHeader } from '../../../../components/IOScrollViewWithLargeHeader';
import { wellKnownCredential, getCredentialNameByType } from '../../utils/credentials';

const availableCredentials = [wellKnownCredential.PID, wellKnownCredential.DRIVING_LICENSE];

function getCredentialIconByType(type :string) : IOIcons | undefined {
    switch (type) {
        case wellKnownCredential.PID :
            return 'fingerprint';
        case wellKnownCredential.DRIVING_LICENSE :
            return 'car';
        default :
            return undefined;
    }
}

const SelectCredential = () => {
    const navigation = useNavigation();
    const {t} = useTranslation(['wallet']);

    useHeaderSecondLevel({
        title: '',
        goBack: () => {
        navigation.goBack();
        },
        supportRequest: true
    });

    return (
        <IOScrollViewWithLargeHeader
            title={{
                label : t('wallet:addcredential.choosecredentialtoadd.title')
            }}
        >
            <View style={styles.wrapper}>
                <ListItemHeader 
                    label='Documents'
                />
                <VStack space={8}>
                    {
                        availableCredentials.map((credential, index) => {
                            const iconType = getCredentialIconByType(credential);
                            if (iconType) {
                                return (
                                    <ModuleCredential
                                        key={credential + '_' + String(index)}
                                        icon={iconType!}
                                        label={getCredentialNameByType(credential)}
                                        onPress={() => {}}
                                        badge={credential === wellKnownCredential.PID ? {text : "Saved", variant : 'success' } : undefined}
                                    />
                                );
                            }
                            return <></>;
                        })
                    }
                </VStack>
            </View>
        </IOScrollViewWithLargeHeader>
    );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 16,
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    gap: 16
  }
});

export default SelectCredential;