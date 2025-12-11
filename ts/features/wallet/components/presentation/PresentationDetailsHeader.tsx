import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Alert, VSpacer } from '@pagopa/io-app-design-system';
import { StoredCredential } from '../../utils/types';
import {
  getCredentialAlertPropsByCredentialType,
  getThemeColorByCredentialType
} from '../../utils/style';
import FocusAwareStatusBar from '../../../../components/FocusAwareStatusBar';
import { PresentationCredentialCard } from './PresentationCredentialCard';

type ItwPresentationDetailsHeaderProps = { credential: StoredCredential };

/**
 * This component renders the header for the presentation details screen of a credential
 * If the credential needs to show the card, it will render the card, otherwise it will render the header with the title
 */
const PresentationDetailsHeader = ({
  credential
}: ItwPresentationDetailsHeaderProps) => {
  const { backgroundColor, statusBarStyle } = getThemeColorByCredentialType(
    credential.credentialType
  );

  const alertProps = getCredentialAlertPropsByCredentialType(
    credential.credentialType
  );

  return (
    <View>
      <FocusAwareStatusBar
        backgroundColor={backgroundColor}
        barStyle={statusBarStyle}
      />
      <PresentationCredentialCard credential={credential} />
      {alertProps && (
        <>
          <VSpacer size={24} />
          <View style={styles.alertContainer}>
            <Alert {...alertProps} />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  alertContainer: {
    paddingHorizontal: 16
  }
});

const MemoizedItwPresentationDetailsHeader = memo(PresentationDetailsHeader);

export { MemoizedItwPresentationDetailsHeader as PresentationDetailsHeader };
