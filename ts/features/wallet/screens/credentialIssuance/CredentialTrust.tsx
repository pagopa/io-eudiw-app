import {
  Body,
  FeatureInfo,
  FooterActions,
  ForceScrollDownView,
  H2,
  HSpacer,
  Icon,
  IOVisualCostants,
  VSpacer
} from '@pagopa/io-app-design-system';
import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {SdJwt} from '@pagopa/io-react-native-wallet';
import {useAppDispatch, useAppSelector} from '../../../../store';
import {selectCredential} from '../../store/credentials';
import {
  getCredentialNameByType,
  wellKnownCredential
} from '../../utils/credentials';
import {useHeaderSecondLevel} from '../../../../hooks/useHeaderSecondLevel';
import {
  resetCredentialIssuance,
  selectCredentialIssuancePostAuthStatus,
  selectRequestedCredential,
  setCredentialIssuancePostAuthRequest
} from '../../store/credentialIssuance';
import PresentationClaimsList from '../../components/presentation/PresentationClaimsList';
import {Descriptor, OptionalClaimsNames} from '../../store/presentation';

/**
 * Screen which shows the user the credentials and claims that will be shared with the credential issuer
 * in order to obtain the requisted credential.
 */
const CredentialTrust = () => {
  const dispatch = useAppDispatch();
  const [optionalChecked, setOptionalChecked] = useState([] as Array<string>);
  const pid = useAppSelector(selectCredential(wellKnownCredential.PID));
  const {t} = useTranslation(['global', 'wallet']);
  const {loading, error, success} = useAppSelector(
    selectCredentialIssuancePostAuthStatus
  );
  const requestedCredential = useAppSelector(selectRequestedCredential);
  const navigation = useNavigation();

  const navigateToErrorScreen = useCallback(
    () =>
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'CREDENTIAL_ISSUANCE_FAILURE'
      }),
    [navigation]
  );

  const goBack = useCallback(() => {
    navigation.goBack();
    dispatch(resetCredentialIssuance());
  }, [dispatch, navigation]);

  useHeaderSecondLevel({title: '', goBack});

  /**
   * When the post auth request is successful, navigate to the preview screen
   * which shows the credential preview.
   */
  useEffect(() => {
    if (success.status) {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'CREDENTIAL_ISSUANCE_PREVIEW'
      });
    }
  }, [navigation, success.status]);

  /**
   * If an error occurs during the post auth request, navigate to the error screen.
   */
  useEffect(() => {
    if (error.status) {
      navigateToErrorScreen();
    }
  });

  // This should never happen, however we need to handle because pid might be undefined
  if (!pid) {
    navigateToErrorScreen();
    return null;
  }

  /**
   * Callback for when the user checks or unchecks an optional disclosure
   * in the PresentationClaimsList component.
   * @param encoded - The encoded string of the optional disclosure
   */
  const onOptionalDisclosuresChange = (encoded: OptionalClaimsNames) => {
    if (optionalChecked.includes(encoded)) {
      setOptionalChecked(optionalChecked.filter(item => item !== encoded));
    } else {
      setOptionalChecked([...optionalChecked, encoded]);
    }
  };

  // This is a mocked descriptor for the PID credential to show its claims in the PresentationClaimsList component
  const pidCredentialJwt = SdJwt.decode(pid.credential);
  const requiredDisclosures = pidCredentialJwt.disclosures.filter((disclosure => disclosure.decoded[1] !== 'iat')).map(disclosure => ({
    name: disclosure.decoded[1],
    value: disclosure.decoded[2]
  }));
  const mockedDescriptorForPid: Descriptor = [
    {
      credential: pid.credential,
      evaluatedDisclosure: {
        requiredDisclosures,
        optionalDisclosures: []
      },
      inputDescriptor: {
        constraints: {},
        id: 'test'
      },
      keyTag: pid.keyTag
    }
  ];

  return (
    <ForceScrollDownView>
      <View style={{margin: IOVisualCostants.appMarginDefault, flexGrow: 1}}>
        <VSpacer size={24} />
        <View style={styles.header}>
          <Icon name={'device'} color={'grey-450'} size={24} />
          <HSpacer size={8} />
          <Icon name={'transactions'} color={'grey-450'} size={24} />
          <HSpacer size={8} />
          <Icon name={'institution'} color={'grey-450'} size={24} />
        </View>
        <VSpacer size={24} />
        <H2>
          {t('wallet:credentialIssuance.trust.title', {
            credential: getCredentialNameByType(requestedCredential)
          })}
        </H2>
        <Body> {t('wallet:credentialIssuance.trust.subtitle')}</Body>
        <VSpacer size={8} />
        <PresentationClaimsList
          optionalChecked={optionalChecked}
          setOptionalChecked={onOptionalDisclosuresChange}
          descriptor={mockedDescriptorForPid}
          source={getCredentialNameByType(wellKnownCredential.PID)}
        />
        <VSpacer size={24} />
        <FeatureInfo
          iconName="fornitori"
          body={t('wallet:credentialIssuance.trust.disclaimer.store')}
        />
        <VSpacer size={24} />
        <FeatureInfo
          iconName="trashcan"
          body={t('wallet:credentialIssuance.trust.disclaimer.retention')}
        />
      </View>
      <FooterActions
        fixed={false}
        actions={{
          type: 'TwoButtons',
          primary: {
            label: t('global:buttons.continue'),
            onPress: () => dispatch(setCredentialIssuancePostAuthRequest()),
            loading
          },
          secondary: {
            label: t('global:buttons.cancel'),
            onPress: goBack
          }
        }}
      />
    </ForceScrollDownView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center'
  }
});

export default CredentialTrust;
