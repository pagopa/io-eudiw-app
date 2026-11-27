import { FocusAwareStatusBar } from '@io-eudiw-app/commons';
import { Body, H2, Tag } from '@pagopa/io-app-design-system';
import { Size, Image as SkiaImage } from '@shopify/react-native-skia';
import Color from 'color';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import CertifiedEudiWalletLogo from '../../../assets/img/brand/certified_eudi_wallet.svg';
import ItwAvatar from '../../../assets/img/brand/itw_avatar.svg';
import { useItwDisplayCredentialStatus } from '../../hooks/useItwDisplayCredentialStatus';
import { useAppSelector } from '../../store';
import { itwCredentialsPidStatusSelector } from '../../store/credentials';
import { selectIsRemoteKeyLocked } from '../../store/instance';
import { itwCredentialStatusSelector } from '../../store/selectors/wallet';
import { wellKnownCredential } from '../../utils/credentials';
import { useCachedImage } from '../../utils/imageCache';
import { ItwCredentialCapabilities } from '../../utils/itwCredentialCapabilities';
import {
  getCredentialNameFromType,
  useTagPropsByStatus
} from '../../utils/itwCredentialUtils';
import { ISSUER_MOCK_NAME } from '../../utils/itwMocksUtils';
import { StoredCredentialMetadata } from '../../utils/itwTypesUtils';
import { useCredentialCardConfig } from '../credential/ItwCredentialCard/config';
import { ItwCredentialDetailCard } from '../ItwCredentialDetailCard';

// Ring of EU stars with its size and offset from the bottom-right corner of the heade
const PID_HEADER_STARS = {
  offset: { bottom: 123, right: 163 },
  size: { height: 187, width: 189 },
  source: require('../../../assets/img/cards/overlay/pid_header_stars.png')
};

/**
 * Ring of EU stars drawn in the bottom-right corner of the PID header. Must be placed inside a Skia Canvas.
 */
const PidHeaderStars = ({ height, width }: Size) => {
  const image = useCachedImage(PID_HEADER_STARS.source);

  return (
    <SkiaImage
      fit="contain"
      image={image}
      x={width - PID_HEADER_STARS.offset.right}
      y={height - PID_HEADER_STARS.offset.bottom}
      {...PID_HEADER_STARS.size}
    />
  );
};

const renderPidHeaderStars = (size: Size) => <PidHeaderStars {...size} />;

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
  // The PID cannot be used while its Remote WSCD key is locked
  const isRemoteKeyLocked = useAppSelector(selectIsRemoteKeyLocked);
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
  const { t } = useTranslation('hsm');

  const authSourceName = ISSUER_MOCK_NAME;
  const credentialName = getCredentialNameFromType(credential.credentialType);

  const isLight = useMemo(() => Color(color).isLight(), [color]);

  if (credential.credentialType === wellKnownCredential.PID) {
    return (
      <>
        <FocusAwareStatusBar backgroundColor={color} barStyle="dark-content" />
        <ItwCredentialDetailCard
          credentialStatus={displayStatus}
          credentialType={credential.credentialType}
          isDisabled={isRemoteKeyLocked}
          renderOverlay={renderPidHeaderStars}
          style={styles.pidCard}
        >
          <View style={styles.pidContent}>
            <H2 color="blueItalia-500" style={styles.pidTitle}>
              {t('presentation.credentialDetails.pidTitle')}
            </H2>
            <CertifiedEudiWalletLogo
              accessibilityLabel="Certified EUDI Wallet"
              height={24}
              width={93}
            />
          </View>
          {capabilities.showStatusTag &&
            statusTagProps &&
            !isRemoteKeyLocked && (
              <View style={styles.pidStatusTag}>
                <Tag forceLightMode {...statusTagProps} />
              </View>
            )}
        </ItwCredentialDetailCard>
      </>
    );
  }

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
  },
  pidCard: {
    marginHorizontal: 0,
    paddingBottom: 32
  },
  pidContent: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 8
  },
  pidStatusTag: {
    alignSelf: 'flex-start',
    marginLeft: 8,
    marginTop: 8
  },
  pidTitle: {
    flex: 1
  }
});

const MemoizedItwPresentationDetailsHeader = memo(ItwPresentationDetailsHeader);

export { MemoizedItwPresentationDetailsHeader as ItwPresentationDetailsHeader };
