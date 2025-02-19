import {
  Avatar,
  ContentWrapper,
  FeatureInfo,
  FooterActions,
  ForceScrollDownView,
  H2,
  HSpacer,
  Icon,
  ListItemHeader,
  VSpacer
} from '@pagopa/io-app-design-system';
import React, {useCallback, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '../../../../store';
import {selectCredential} from '../../store/credentials';
import {
  getCredentialNameByType,
  ISSUER_MOCK_NAME,
  wellKnownCredential
} from '../../utils/credentials';
import {useHeaderSecondLevel} from '../../../../hooks/useHeaderSecondLevel';
import Markdown from '../../../../components/markdown';
import {
  resetCredentialIssuance,
  selectCredentialIssuancePostAuthStatus,
  setCredentialIssuancePostAuthRequest
} from '../../store/credentialIssuance';

const CredentialTrust = () => {
  const dispatch = useAppDispatch();
  const pid = useAppSelector(selectCredential(wellKnownCredential.PID));
  const {t} = useTranslation(['global', 'wallet']);
  const {loading, error, success} = useAppSelector(
    selectCredentialIssuancePostAuthStatus
  );
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

  useEffect(() => {
    if (success.status) {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'CREDENTIAL_ISSUANCE_PREVIEW'
      });
    }
  }, [navigation, success.status]);

  useEffect(() => {
    if (error.status) {
      navigateToErrorScreen();
    }
  });

  if (!pid) {
    // This should never happen, however we need to handle because pid might be undefined
    navigateToErrorScreen();
    return null;
  }

  // const claims = parseClaims(pid.parsedCredential);
  // const requiredClaims = claims.map(
  //   claim =>
  //     ({
  //       claim,
  //       source: getCredentialNameByType(pid.credentialType)
  //     } as RequiredClaim[])
  // );

  return (
    <ForceScrollDownView>
      <ContentWrapper>
        <VSpacer size={24} />
        <View style={styles.header}>
          <Avatar
            size="small"
            logoUri={require('../../../../../assets/img/issuer/IPZS.png')}
          />
          <HSpacer size={8} />
          <Icon name={'transactions'} color={'grey-450'} size={24} />
          <HSpacer size={8} />
          <Avatar
            size="small"
            logoUri={require('../../../../../assets/img/app/logo.png')}
          />
        </View>
        <VSpacer size={24} />
        <H2>
          {t('wallet:credentialIssuance.trust.title', {
            credential: getCredentialNameByType(pid.credentialType)
          })}
        </H2>
        <Markdown
          content={t('wallet:credentialIssuance.trust.subtitle', {
            authority: ISSUER_MOCK_NAME
          })}
        />
        <VSpacer size={8} />
        <ListItemHeader
          label={t('wallet:credentialIssuance.trust.requiredData')}
          iconName="security"
          iconColor="grey-700"
        />
        {/* <PresentationClaimsList
          optionalChecked={optionalChecked}
          setOptionalChecked={onOptionalDisclosuresChange}
          descriptor={route.params.descriptor}
          source={getCredentialNameByType(wellKnownCredential.PID)}
        /> */}
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
        <VSpacer size={32} />
      </ContentWrapper>
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
