import { memo } from 'react';
import { View } from 'react-native';
import { StoredCredential } from '../../utils/types';
import { getThemeColorByCredentialType } from '../../utils/style';
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

  return (
    <View>
      <FocusAwareStatusBar
        backgroundColor={backgroundColor}
        barStyle={statusBarStyle}
      />
      <PresentationCredentialCard credential={credential} />
    </View>
  );
};

const MemoizedItwPresentationDetailsHeader = memo(PresentationDetailsHeader);

export { MemoizedItwPresentationDetailsHeader as PresentationDetailsHeader };
