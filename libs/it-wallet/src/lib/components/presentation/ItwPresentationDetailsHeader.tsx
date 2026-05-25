import {
  ContentWrapper,
  makeFontStyleObject,
  useIOExperimentalDesign
} from '@pagopa/io-app-design-system';
import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BonusCard } from '../BonusCard/BonusCard';
import { lifecycleIsValidSelector } from '../../store/lifecycle';
import { ParsedClaimsRecord } from '../../utils/claims';
import {
  wellKnownCredential,
  WellKnownCredentialTypes
} from '../../utils/credentials';
import { getCredentialNameFromType } from '../../utils/itwCredentialUtils';
import { useThemeColorByCredentialType } from '../../utils/itwStyleUtils';
import { StoredCredential } from '../../utils/itwTypesUtils';
import { ItwPresentationCredentialCard } from './ItwPresentationCredentialCard';
import { useAppSelector } from '../../store';
import { FocusAwareStatusBar } from '@io-eudiw-app/commons';

type ItwPresentationDetailsHeaderProps = {
  credential: StoredCredential;
  parsedClaims: ParsedClaimsRecord;
};

/**
 * Credentials that should display a skeumorphic card
 */
const credentialsWithSkeumorphicCard: ReadonlyArray<string> = [
  wellKnownCredential.DRIVING_LICENSE,
  wellKnownCredential.DISABILITY_CARD
];

/**
 * This component renders the header for the presentation details screen of a credential
 * If the credential needs to show the card, it will render the card, otherwise it will render the header with the title
 */
const ItwPresentationDetailsHeader = ({
  credential,
  parsedClaims
}: ItwPresentationDetailsHeaderProps) => {
  const { isExperimental } = useIOExperimentalDesign();
  const itwFeaturesEnabled = useAppSelector(lifecycleIsValidSelector);

  const { backgroundColor, textColor, statusBarStyle } =
    useThemeColorByCredentialType(
      credential.credentialType as WellKnownCredentialTypes,
      itwFeaturesEnabled
    );
  const organizationName =
    credential.issuerConf.federation_entity.organization_name;
  const logoUri = credential.issuerConf.federation_entity.logo_uri;

  const headerContent = useMemo(() => {
    if (credentialsWithSkeumorphicCard.includes(credential.credentialType)) {
      return (
        <ItwPresentationCredentialCard
          credential={credential}
          parsedClaims={parsedClaims}
        />
      );
    }

    if (credential.credentialType === wellKnownCredential.BONUS_PARI) {
      return (
        <View style={styles.header}>
          <BonusCard
            name={getCredentialNameFromType(credential.credentialType)}
            organizationName={organizationName || ''}
            logoUris={logoUri ? [{ uri: logoUri }] : undefined}
            status={<></>}
            cardColorSchemeValues={{
              background: '#7AC1FA',
              foreground: '#6EA8FF',
              text: 'black'
            }}
          />
        </View>
      );
    }

    return (
      <View style={[styles.header, { backgroundColor }]}>
        <ContentWrapper>
          <Text
            style={[
              isExperimental
                ? styles.headerLabelExperimental
                : styles.headerLabel,
              { color: textColor }
            ]}
            accessibilityRole="header"
          >
            {getCredentialNameFromType(credential.credentialType)}
          </Text>
        </ContentWrapper>
      </View>
    );
  }, [
    credential,
    logoUri,
    organizationName,
    parsedClaims,
    backgroundColor,
    textColor,
    isExperimental
  ]);

  return (
    <View>
      <FocusAwareStatusBar
        backgroundColor={backgroundColor}
        barStyle={statusBarStyle}
      />
      {headerContent}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: -300,
    paddingTop: 300,
    justifyContent: 'flex-end',
    paddingBottom: 24
  },
  headerLabel: {
    ...makeFontStyleObject(26, 'TitilliumSansPro', 30, 'Semibold')
  },
  headerLabelExperimental: {
    ...makeFontStyleObject(26, 'Titillio', 30, 'Semibold')
  }
});

const MemoizedItwPresentationDetailsHeader = memo(ItwPresentationDetailsHeader);

export { MemoizedItwPresentationDetailsHeader as ItwPresentationDetailsHeader };
