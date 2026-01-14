import {
  ContentWrapper,
  makeFontStyleObject,
  useIOExperimentalDesign
} from '@pagopa/io-app-design-system';
import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StoredCredential } from '../../utils/types';
import { CredentialType } from '../../utils/itwMocksUtils';
import { useThemeColorByCredentialType } from '../../utils/itwStyleUtils';
import { getCredentialNameFromType } from '../../utils/itwCredentialUtils';
import FocusAwareStatusBar from '../../../../components/FocusAwareStatusBar';
import { useAppSelector } from '../../../../store';
import { lifecycleIsValidSelector } from '../../store/lifecycle';
import { wellKnownCredential } from '../../utils/credentials';
import { ItwPresentationCredentialCard } from './ItwPresentationCredentialCard';

type ItwPresentationDetailsHeaderProps = {
  credential: StoredCredential;
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
  credential
}: ItwPresentationDetailsHeaderProps) => {
  const { isExperimental } = useIOExperimentalDesign();
  const itwFeaturesEnabled = useAppSelector(lifecycleIsValidSelector);

  const { backgroundColor, textColor, statusBarStyle } =
    useThemeColorByCredentialType(
      credential.credentialType as CredentialType,
      itwFeaturesEnabled
    );

  const headerContent = useMemo(() => {
    if (credentialsWithSkeumorphicCard.includes(credential.credentialType)) {
      return <ItwPresentationCredentialCard credential={credential} />;
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
  }, [credential, backgroundColor, textColor, isExperimental]);

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
