import {
  IOVisualCostants,
  ListItemHeader,
  VStack
} from '@pagopa/io-app-design-system';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useAppSelector} from '../../../../store';
import {IOScrollViewWithLargeHeader} from '../../../../components/IOScrollViewWithLargeHeader';
import {wellKnownCredential} from '../../utils/credentials';
import {ItwOnboardingModuleCredential} from '../../components/OnboardingModuleCredential';
import {useHeaderSecondLevel} from '../../../../hooks/useHeaderSecondLevel';
import {selectCredentials} from '../../store/credentials';

const IssuanceList = () => {
  const {t} = useTranslation('wallet');
  const credentials = useAppSelector(selectCredentials);

  useHeaderSecondLevel({
    title: ''
  });

  const isCredentialSaved = (type: string) =>
    credentials.find(c => c.credentialType === type) !== undefined;

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: t('credentialIssuance.list.title')
      }}>
      <View style={styles.wrapper}>
        <ListItemHeader label={t('credentialIssuance.list.header')} />
        <VStack space={8}>
          {Object.entries(wellKnownCredential).map(([_, type]) => (
            <ItwOnboardingModuleCredential
              key={`itw_credential_${type}`}
              type={type}
              isSaved={isCredentialSaved(type)}
              isFetching={false}
              onPress={() => void 0}
            />
          ))}
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

export default IssuanceList;
