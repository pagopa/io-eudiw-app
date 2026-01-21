import {
  Divider,
  H6,
  IconButton,
  useIOTheme
} from '@pagopa/io-app-design-system';
import { Fragment, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import I18n from 'i18next';
import { getCredentialStatus } from '../../utils/itwCredentialStatusUtils';
import { WellKnownClaim } from '../../utils/itwClaimsUtils';
import { ItwCredentialClaim } from '../credential/ItwCredentialClaim';
import { ItwIssuanceMetadata } from '../ItwIssuanceMetadata';
import { ItwQrCodeClaimImage } from '../credential/ItwQrCodeClaimImage';
import { useAppDispatch, useAppSelector } from '../../../../store';
import {
  itwIsClaimValueHiddenSelector,
  itwSetClaimValuesHidden
} from '../../store/credentials';
import { StoredCredential } from '../../utils/itwTypesUtils';
import { ParsedClaimsRecord } from '../../utils/claims';

type ItwPresentationClaimsSectionProps = {
  credential: StoredCredential;
  parsedClaims: ParsedClaimsRecord;
};

export const ItwPresentationClaimsSection = ({
  credential,
  parsedClaims
}: ItwPresentationClaimsSectionProps) => {
  const theme = useIOTheme();

  const credentialStatus = useMemo(
    () => getCredentialStatus(credential),
    [credential]
  );

  const valuesHidden = useAppSelector(itwIsClaimValueHiddenSelector);
  const dispatch = useAppDispatch();

  const handleToggleClaimVisibility = () => {
    dispatch(itwSetClaimValuesHidden(!valuesHidden));
  };

  const renderHideValuesToggle = () => (
    <View
      accessible={true}
      accessibilityLabel={I18n.t(
        'presentation.credentialDetails.actions.hideClaimValues',
        {
          ns: 'wallet'
        }
      )}
      accessibilityRole="switch"
      accessibilityState={{ checked: valuesHidden }}
    >
      <IconButton
        testID="toggle-claim-visibility"
        icon={valuesHidden ? 'eyeHide' : 'eyeShow'}
        onPress={handleToggleClaimVisibility}
        accessibilityLabel={I18n.t(
          'presentation.credentialDetails.actions.hideClaimValues',
          {
            ns: 'wallet'
          }
        )}
      />
    </View>
  );

  const claims = Object.entries(parsedClaims);
  const filteredClaims = useMemo(
    () => claims.filter(([id]) => id !== WellKnownClaim.link_qr_code),
    [claims]
  );

  const LinkQrCode = useCallback(() => {
    const linkQrCodeClaim = claims.find(
      ([id]) => id === WellKnownClaim.link_qr_code
    )?.[1];

    if (!linkQrCodeClaim) {
      return null;
    }

    return <ItwQrCodeClaimImage claim={linkQrCodeClaim} />;
  }, [claims]);

  return (
    <View>
      {
        // If do not have claims, we should not render the title and the toggle
        claims.length > 0 && (
          <>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <H6 color={theme['textHeading-tertiary']}>
                {I18n.t('presentation.credentialDetails.documentDataTitle', {
                  ns: 'wallet'
                })}
              </H6>
              {renderHideValuesToggle()}
            </View>
          </>
        )
      }
      <LinkQrCode />
      {filteredClaims.map(([id, claim], index) => {
        if (id === WellKnownClaim.link_qr_code) {
          // Since the `link_qr_code` claim  difficult to distinguish from a generic image claim, we need to manually
          // check for the claim and render it accordingly
          return <ItwQrCodeClaimImage key={index} claim={claim} />;
        }

        return (
          <Fragment key={index}>
            {index !== 0 && <Divider />}
            <ItwCredentialClaim
              claim={claim}
              isPreview={false}
              hidden={valuesHidden}
              credentialStatus={credentialStatus}
            />
          </Fragment>
        );
      })}
      {claims.length > 0 && <Divider />}
      <ItwIssuanceMetadata credential={credential} isPreview={false} />
    </View>
  );
};
