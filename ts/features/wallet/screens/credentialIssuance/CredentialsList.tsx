import {
  IOVisualCostants,
  ListItemHeader,
  VStack
} from '@pagopa/io-app-design-system';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { IOScrollViewWithLargeHeader } from '../../../../components/IOScrollViewWithLargeHeader';
import {
  CredentialsKeys,
  wellKnownCredential,
  wellKnownCredentialConfigurationIDs
} from '../../utils/credentials';
import { OnboardingModuleCredential } from '../../components/credential/OnboardingModuleCredential';
import { useHeaderSecondLevel } from '../../../../hooks/useHeaderSecondLevel';
import { selectCredentials } from '../../store/credentials';
import {
  resetCredentialIssuance,
  selectRequestedCredential,
  setCredentialIssuancePreAuthRequest
} from '../../store/credentialIssuance';
import { lifecycleIsOperationalSelector } from '../../store/lifecycle';
import { setPendingCredential } from '../../store/pidIssuance';
import MAIN_ROUTES from '../../../../navigation/main/routes';
import WALLET_ROUTES from '../../navigation/routes';
import { useCredentialIssuanceNavigationListeners } from '../../hooks/useCredentialIssuanceNavigationListeners';

/**
 * The list of the obtainable credentias.
 * Each credential has a button that allows the user to request it.
 * It also shows a badge if the credential is already saved or a loading indicator if the credential is being requested.
 */
const CredentialsList = () => {
  const { t } = useTranslation('wallet');
  const credentials = useAppSelector(selectCredentials);
  const dispatch = useAppDispatch();
  const requestedCredential = useAppSelector(selectRequestedCredential);
  const navigation = useNavigation();

  const goBack = useCallback(() => {
    navigation.goBack();
    dispatch(resetCredentialIssuance());
  }, [dispatch, navigation]);

  const isCredentialSaved = (type: string) =>
    credentials.find(c => c.credentialType === type) !== undefined;

  const isCredentialRequested = (type: string) => requestedCredential === type;

  const shouldIssuePidFirst = useAppSelector(lifecycleIsOperationalSelector);
  useCredentialIssuanceNavigationListeners();

  useHeaderSecondLevel({
    title: '',
    goBack
  });

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: t('credentialIssuance.list.title')
      }}
    >
      <View style={styles.wrapper}>
        <ListItemHeader label={t('credentialIssuance.list.header')} />
        <VStack space={8}>
          {Object.entries(wellKnownCredential)
            .filter(([_, type]) => type !== wellKnownCredential.PID)
            .map(([credentialKey, type]) => (
              <OnboardingModuleCredential
                key={`itw_credential_${type}`}
                type={type}
                configId={
                  wellKnownCredentialConfigurationIDs[
                    credentialKey as CredentialsKeys
                  ]
                }
                isSaved={isCredentialSaved(type)}
                isFetching={isCredentialRequested(
                  wellKnownCredentialConfigurationIDs[
                    credentialKey as CredentialsKeys
                  ]
                )}
                onPress={c => {
                  if (shouldIssuePidFirst) {
                    dispatch(setPendingCredential({ credential: c }));
                    navigation.navigate(MAIN_ROUTES.WALLET_NAV, {
                      screen: WALLET_ROUTES.PID_ISSUANCE.INSTANCE_CREATION
                    });
                    return;
                  }
                  dispatch(
                    setCredentialIssuancePreAuthRequest({ credential: c })
                  );
                }}
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

export default CredentialsList;
