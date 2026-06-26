import { Body, H2, Tag } from '@pagopa/io-app-design-system';
import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { wellKnownCredential } from '../../utils/credentials';
import {
  getCredentialNameFromType,
  useTagPropsByStatus
} from '../../utils/itwCredentialUtils';
import { StoredCredential } from '../../utils/itwTypesUtils';
import { useAppSelector } from '../../store';
import { FocusAwareStatusBar } from '@io-eudiw-app/commons';
import { useCredentialCardConfig } from '../credential/ItwCredentialCard/config';
import { itwCredentialsPidStatusSelector } from '../../store/credentials';
import { itwCredentialStatusSelector } from '../../store/selectors/wallet';
import { useItwDisplayCredentialStatus } from '../../hooks/useItwDisplayCredentialStatus';
import Color from 'color';
import { ISSUER_MOCK_NAME } from '../../utils/itwMocksUtils';
import { ItwCredentialDetailCard } from '../ItwCredentialDetailCard';
import ItwAvatar from '../../../assets/img/brand/itw_avatar.svg';
import { ItwCredentialCapabilities } from '../../utils/itwCredentialCapabilities';

type ItwPresentationDetailsHeaderProps = {
  credential: StoredCredential;
  capabilities: ItwCredentialCapabilities;
};

/**
 * This component renders the header for the presentation details screen of a credential
 * If the credential needs to show the card, it will render the card, otherwise it will render the header with the title
 */
const ItwPresentationDetailsHeader = ({
  credential,
  capabilities
}: ItwPresentationDetailsHeaderProps) => {
  // Credential's header card is always in light mode
  const { color } = useCredentialCardConfig(credential.credentialType, 'light');
  const pidStatus = useAppSelector(itwCredentialsPidStatusSelector);
  const { status: credentialRawStatus } = useAppSelector(state =>
    itwCredentialStatusSelector(state, credential.credentialType)
  );
  // PID is excluded from itwCredentialStatusSelector, so read its status from eidStatus directly
  const rawStatus =
    credential.credentialType === wellKnownCredential.PID
      ? (pidStatus ?? 'valid')
      : (credentialRawStatus ?? 'valid');
  const displayStatus = useItwDisplayCredentialStatus(rawStatus);
  const tagPropsByStatus = useTagPropsByStatus();
  const statusTagProps = tagPropsByStatus[displayStatus];

  const authSourceName = ISSUER_MOCK_NAME;
  const credentialName = getCredentialNameFromType(credential.credentialType);

  const isLight = useMemo(() => Color(color).isLight(), [color]);

  return (
    <>
      <FocusAwareStatusBar
        backgroundColor={color}
        barStyle={isLight ? 'dark-content' : 'light-content'}
      />
      <ItwCredentialDetailCard
        credentialType={credential.credentialType}
        credentialStatus={displayStatus}
      >
        <ItwAvatar width={48} height={48} />
        <H2
          style={styles.nameText}
          color={isLight ? 'blueItalia-850' : 'white'}
        >
          {credentialName}
        </H2>
        {authSourceName && (
          <Body
            style={styles.authSourceText}
            color={isLight ? 'blueItalia-850' : 'white'}
          >
            {authSourceName}
          </Body>
        )}
        {capabilities.showStatusTag && statusTagProps && (
          <View style={{ marginTop: 16 }}>
            <Tag forceLightMode {...statusTagProps} />
          </View>
        )}
      </ItwCredentialDetailCard>
    </>
  );
};

const styles = StyleSheet.create({
  nameText: {
    textAlign: 'center',
    marginTop: 16
  },
  authSourceText: {
    textAlign: 'center',
    marginHorizontal: 16,
    paddingTop: 4
  }
});

const MemoizedItwPresentationDetailsHeader = memo(ItwPresentationDetailsHeader);

export { MemoizedItwPresentationDetailsHeader as ItwPresentationDetailsHeader };
