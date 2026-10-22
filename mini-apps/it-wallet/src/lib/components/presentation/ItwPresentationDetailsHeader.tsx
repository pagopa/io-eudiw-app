import { FocusAwareStatusBar } from '@io-eudiw-app/commons';
import { Body, H2, Tag } from '@pagopa/io-app-design-system';
import Color from 'color';
import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import ItwAvatar from '../../../assets/img/brand/itw_avatar.svg';
import { useItwDisplayCredentialStatus } from '../../hooks/useItwDisplayCredentialStatus';
import { useAppSelector } from '../../store';
import { itwCredentialsPidStatusSelector } from '../../store/credentials';
import { itwCredentialStatusSelector } from '../../store/selectors/wallet';
import { wellKnownCredential } from '../../utils/credentials';
import { ItwCredentialCapabilities } from '../../utils/itwCredentialCapabilities';
import {
  getCredentialNameFromType,
  useTagPropsByStatus
} from '../../utils/itwCredentialUtils';
import { ISSUER_MOCK_NAME } from '../../utils/itwMocksUtils';
import { StoredCredentialMetadata } from '../../utils/itwTypesUtils';
import { useCredentialCardConfig } from '../credential/ItwCredentialCard/config';
import { ItwCredentialDetailCard } from '../ItwCredentialDetailCard';

type ItwPresentationDetailsHeaderProps = {
  capabilities: ItwCredentialCapabilities;
  credential: StoredCredentialMetadata;
};

/**
 * This component renders the header for the presentation details screen of a credential
 * If the credential needs to show the card, it will render the card, otherwise it will render the header with the title
 */
const ItwPresentationDetailsHeader = ({
  capabilities,
  credential
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
        credentialStatus={displayStatus}
        credentialType={credential.credentialType}
      >
        <ItwAvatar height={48} width={48} />
        <H2
          color={isLight ? 'blueItalia-850' : 'white'}
          style={styles.nameText}
        >
          {credentialName}
        </H2>
        {authSourceName && (
          <Body
            color={isLight ? 'blueItalia-850' : 'white'}
            style={styles.authSourceText}
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
  authSourceText: {
    marginHorizontal: 16,
    paddingTop: 4,
    textAlign: 'center'
  },
  nameText: {
    marginTop: 16,
    textAlign: 'center'
  }
});

const MemoizedItwPresentationDetailsHeader = memo(ItwPresentationDetailsHeader);

export { MemoizedItwPresentationDetailsHeader as ItwPresentationDetailsHeader };
