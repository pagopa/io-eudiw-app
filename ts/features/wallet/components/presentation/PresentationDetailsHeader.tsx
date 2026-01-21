import { memo } from 'react';
import { View } from 'react-native';
import { getThemeColorByCredentialType } from '../../utils/style';
import FocusAwareStatusBar from '../../../../components/FocusAwareStatusBar';
import { StoredCredential } from '../../utils/itwTypesUtils';
import { ParsedClaimsRecord } from '../../utils/claims';
import { PresentationCredentialCard } from './PresentationCredentialCard';

type ItwPresentationDetailsHeaderProps = {
  credential: StoredCredential;
  claims: ParsedClaimsRecord;
};

/**
 * This component renders the header for the presentation details screen of a credential
 * If the credential needs to show the card, it will render the card, otherwise it will render the header with the title
 */
const PresentationDetailsHeader = ({
  credential,
  claims
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
      <PresentationCredentialCard credential={credential} claims={claims} />
    </View>
  );
};

const MemoizedItwPresentationDetailsHeader = memo(PresentationDetailsHeader);

export { MemoizedItwPresentationDetailsHeader as PresentationDetailsHeader };
