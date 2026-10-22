import { IOScrollView, useHeaderSecondLevel } from '@io-eudiw-app/commons';
import {
  ContentWrapper,
  H2,
  IOColors,
  IOMarkdown,
  VSpacer
} from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, View } from 'react-native';

import { CredentialIssuanceNavigatorParamsList } from '../../navigation/credentialIssuance/CredentialIssuanceNavigator';
import CREDENTIAL_ISSUANCE_ROUTES from '../../navigation/credentialIssuance/routes';
import MAIN_ROUTES from '../../navigation/main/routes';
import PID_ISSUANCE_ROUTES from '../../navigation/pidIssuance/routes';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  resetCredentialIssuance,
  selectCredentialIssuancePreAuthStatus,
  setCredentialIssuancePreAuthRequest
} from '../../store/credentialIssuance';
import { lifecycleIsOperationalSelector } from '../../store/lifecycle';
import { setPendingCredential } from '../../store/pidIssuance';
import {
  getCredentialNameByType,
  getCredentialTypeByConfigId,
  wellKnownCredential
} from '../../utils/credentials';

export type CredentialIntroductionParams = {
  credential: string;
};

type Props = StackScreenProps<
  CredentialIssuanceNavigatorParamsList,
  typeof CREDENTIAL_ISSUANCE_ROUTES.INTRODUCTION
>;

const introHero = Image.resolveAssetSource(
  require('../../../assets/img/issuance/intro_hero.png')
);

// Maps each credential type to the locale key of its introduction text
const introContentKeys = {
  [wellKnownCredential.DISABILITY_CARD]:
    'issuance.credentialIntroduction.content.disabilityCard',
  [wellKnownCredential.DRIVING_LICENSE]:
    'issuance.credentialIntroduction.content.mdl'
} as const;

/**
 * Introduction shown after a credential is picked from the catalog.
 * It explains what is needed to obtain the credential and lets the user
 * continue with its issuance. If the PID has not been obtained yet, the
 * credential is queued and the PID activation is started first.
 */
const CredentialIntroduction = ({ route }: Props) => {
  const { credential } = route.params;
  const { t } = useTranslation('wallet');
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const shouldIssuePidFirst = useAppSelector(lifecycleIsOperationalSelector);
  const preAuthStatus = useAppSelector(selectCredentialIssuancePreAuthStatus);

  const credentialType = getCredentialTypeByConfigId(credential);
  const contentKey =
    credentialType && credentialType in introContentKeys
      ? introContentKeys[credentialType as keyof typeof introContentKeys]
      : undefined;

  const goBack = useCallback(() => {
    navigation.goBack();
    dispatch(resetCredentialIssuance());
  }, [dispatch, navigation]);

  useHeaderSecondLevel({
    goBack,
    title: ''
  });

  useEffect(() => {
    if (preAuthStatus.success.status) {
      navigation.navigate(MAIN_ROUTES.CREDENTIAL_ISSUANCE_NAV, {
        screen: CREDENTIAL_ISSUANCE_ROUTES.TRUST
      });
    }
  }, [preAuthStatus.success, navigation]);

  useEffect(() => {
    if (preAuthStatus.error.status) {
      navigation.navigate(MAIN_ROUTES.CREDENTIAL_ISSUANCE_NAV, {
        screen: CREDENTIAL_ISSUANCE_ROUTES.FAILURE
      });
    }
  }, [preAuthStatus.error, navigation]);

  const handleContinue = () => {
    if (shouldIssuePidFirst) {
      dispatch(setPendingCredential({ credential }));
      navigation.navigate(MAIN_ROUTES.PID_ISSUANCE_NAV, {
        screen: PID_ISSUANCE_ROUTES.INSTANCE_CREATION
      });
      return;
    }
    dispatch(setCredentialIssuancePreAuthRequest({ credential }));
  };

  return (
    <IOScrollView
      actions={{
        primary: {
          label: t('buttons.continue', { ns: 'common' }),
          loading: preAuthStatus.loading,
          onPress: handleContinue
        },
        type: 'SingleButton'
      }}
      includeContentMargins={false}
    >
      <Image
        accessibilityIgnoresInvertColors
        source={{ uri: introHero.uri }}
        style={styles.hero}
      />
      <ContentWrapper style={styles.content}>
        <H2>{getCredentialNameByType(credentialType)}</H2>
        <VSpacer size={16} />
        {contentKey && (
          <View style={styles.contentBox}>
            <IOMarkdown content={t(contentKey)} />
          </View>
        )}
      </ContentWrapper>
    </IOScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    marginTop: 24
  },
  contentBox: {
    borderColor: IOColors['grey-100'],
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  hero: {
    aspectRatio: 4 / 3,
    height: 'auto',
    opacity: 0.8,
    resizeMode: 'cover',
    width: '100%'
  }
});

export default CredentialIntroduction;
