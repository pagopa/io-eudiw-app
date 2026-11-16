import { Divider, ListItemInfo } from '@pagopa/io-app-design-system';
import { t } from 'i18next';
import { useMemo } from 'react';

import { useItwInfoBottomSheet } from '../hooks/useItwInfoBottomSheet';
import { wellKnownCredential } from '../utils/credentials';
import { StoredCredentialMetadata } from '../utils/itwTypesUtils';

type ItwIssuanceMetadataProps = {
  credential: StoredCredentialMetadata;
  isPreview?: boolean;
};

type ItwMetadataIssuanceListItemProps = {
  bottomSheet: {
    contentBody: string;
    contentTitle: string;
    onPress: () => void;
  };
  isPreview?: boolean;
  label: string;
  value: string;
};

const ItwMetadataIssuanceListItem = ({
  bottomSheet: bottomSheetProps,
  isPreview,
  label,
  value
}: ItwMetadataIssuanceListItemProps) => {
  const bottomSheet = useItwInfoBottomSheet({
    content: [
      {
        body: bottomSheetProps.contentBody,
        title: bottomSheetProps.contentTitle
      }
    ],
    title: value
  });

  const endElement: ListItemInfo['endElement'] = useMemo(() => {
    if (isPreview) {
      return;
    }

    return {
      componentProps: {
        accessibilityLabel: `Info ${label}`,
        icon: 'info',
        onPress: () => {
          bottomSheetProps.onPress();
          bottomSheet.present();
        }
      },
      type: 'iconButton'
    };
  }, [isPreview, bottomSheet, bottomSheetProps, label]);

  return (
    <>
      <ListItemInfo
        accessibilityLabel={`${label} ${value}`}
        endElement={endElement}
        label={label}
        value={value}
      />
      {bottomSheet.bottomSheet}
    </>
  );
};

/**
 * Renders additional issuance-related metadata, i.e. releaser and auth source.
 * They are not part of the claims list, thus they're rendered separately.
 * @param credential - the credential with the issuer configuration
 * @param isPreview - whether the component is rendered in preview mode which hides the info button.
 * @returns the list items with the metadata.
 */
export const ItwIssuanceMetadata = ({
  credential,
  isPreview
}: ItwIssuanceMetadataProps) => {
  const releaserName =
    credential?.issuerConf?.federation_entity.organization_name;

  /* TODO: [WLEO-846] In case of introduction of the credential catalogue
           it will be necessary to obtain the auth source from it.
  */
  const authSource = t('presentation.authSource', { ns: 'aptitude' });

  const releasedByKey =
    credential.credentialType === wellKnownCredential.PID
      ? 'releasedByPid'
      : 'releasedBy';

  const releaserNameBottomSheet: ItwMetadataIssuanceListItemProps['bottomSheet'] =
    useMemo(
      () => ({
        contentBody: t(
          'issuance.credentialPreview.bottomSheet.about.subtitle',
          {
            ns: 'aptitude',
            privacyUrl: ''
          }
        ),
        contentTitle: t('issuance.credentialPreview.bottomSheet.about.title', {
          ns: 'aptitude'
        }),
        onPress: () => null
      }),
      []
    );

  const authSourceBottomSheet: ItwMetadataIssuanceListItemProps['bottomSheet'] =
    useMemo(
      () => ({
        contentBody: t(
          'issuance.credentialPreview.bottomSheet.authSource.subtitle',
          {
            ns: 'aptitude'
          }
        ),
        contentTitle: t(
          'issuance.credentialPreview.bottomSheet.authSource.title',
          { ns: 'aptitude' }
        ),
        onPress: () => null
      }),
      []
    );

  return (
    <>
      {authSource && (
        <ItwMetadataIssuanceListItem
          bottomSheet={authSourceBottomSheet}
          isPreview={isPreview}
          label={t('verifiableCredentials.claims.authenticSource', {
            ns: 'aptitude'
          })}
          value={authSource}
        />
      )}
      {authSource && releaserName && <Divider />}
      {releaserName && (
        <ItwMetadataIssuanceListItem
          bottomSheet={releaserNameBottomSheet}
          isPreview={isPreview}
          label={t(`verifiableCredentials.claims.${releasedByKey}`, {
            ns: 'aptitude'
          })}
          value={releaserName}
        />
      )}
    </>
  );
};
