import { Divider, ListItemInfo } from '@pagopa/io-app-design-system';
import I18n from 'i18next';
import { useMemo } from 'react';
import { CredentialType } from '../utils/itwMocksUtils';
import { useItwInfoBottomSheet } from '../hooks/useItwInfoBottomSheet';
import { StoredCredential } from '../utils/types';
// import { useAppSelector } from "../../../store";

type ItwIssuanceMetadataProps = {
  credential: StoredCredential;
  isPreview?: boolean;
};

type ItwMetadataIssuanceListItemProps = {
  label: string;
  value: string;
  bottomSheet: {
    contentTitle: string;
    contentBody: string;
    onPress: () => void;
  };
  isPreview?: boolean;
};

const ItwMetadataIssuanceListItem = ({
  label,
  value,
  bottomSheet: bottomSheetProps,
  isPreview
}: ItwMetadataIssuanceListItemProps) => {
  const bottomSheet = useItwInfoBottomSheet({
    title: value,
    content: [
      {
        title: bottomSheetProps.contentTitle,
        body: bottomSheetProps.contentBody
      }
    ]
  });

  const endElement: ListItemInfo['endElement'] = useMemo(() => {
    if (isPreview) {
      return;
    }

    return {
      type: 'iconButton',
      componentProps: {
        icon: 'info',
        accessibilityLabel: `Info ${label}`,
        onPress: () => {
          bottomSheetProps.onPress();
          bottomSheet.present();
        }
      }
    };
  }, [isPreview, bottomSheet, bottomSheetProps, label]);

  return (
    <>
      <ListItemInfo
        endElement={endElement}
        label={label}
        value={value}
        accessibilityLabel={`${label} ${value}`}
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
  // TODO: Understand the origin for these data
  const releaserName = 'PAGOPA';
  // credential.issuerConf.federation_entity.organization_name;

  /*
  const credentialsFromCatalogue = useAppSelector(
    itwCredentialsCatalogueByTypesSelector
  );

  const authSource =
    credentialsFromCatalogue &&
    credentialsFromCatalogue[credential.credentialType]
      ? getItwAuthSource(credentialsFromCatalogue[credential.credentialType])
      : getAuthSource(credential);
   */
  const authSource = 'PAGOPA';

  const releasedByKey =
    credential.credentialType === CredentialType.PID
      ? 'releasedByPid'
      : 'releasedBy';

  const releaserNameBottomSheet: ItwMetadataIssuanceListItemProps['bottomSheet'] =
    useMemo(
      () => ({
        contentTitle: I18n.t(
          'issuance.credentialPreview.bottomSheet.about.title',
          {
            ns: 'wallet'
          }
        ),
        contentBody: I18n.t(
          'issuance.credentialPreview.bottomSheet.about.subtitle',
          {
            ns: 'wallet',
            privacyUrl: ''
          }
        ),
        onPress: () => {}
      }),
      []
    );

  const authSourceBottomSheet: ItwMetadataIssuanceListItemProps['bottomSheet'] =
    useMemo(
      () => ({
        contentTitle: I18n.t(
          'issuance.credentialPreview.bottomSheet.authSource.title',
          { ns: 'wallet' }
        ),
        contentBody: I18n.t(
          'issuance.credentialPreview.bottomSheet.authSource.subtitle',
          {
            ns: 'wallet'
          }
        ),
        onPress: () => {}
      }),
      []
    );

  return (
    <>
      {authSource && (
        <ItwMetadataIssuanceListItem
          label={I18n.t('verifiableCredentials.claims.authenticSource', {
            ns: 'wallet'
          })}
          value={authSource}
          isPreview={isPreview}
          bottomSheet={authSourceBottomSheet}
        />
      )}
      {authSource && releaserName && <Divider />}
      {releaserName && (
        <ItwMetadataIssuanceListItem
          label={I18n.t(`verifiableCredentials.claims.${releasedByKey}`, {
            ns: 'wallet'
          })}
          value={releaserName}
          isPreview={isPreview}
          bottomSheet={releaserNameBottomSheet}
        />
      )}
    </>
  );
};
