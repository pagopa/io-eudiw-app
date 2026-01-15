import {
  Divider,
  H6,
  IconButton,
  useIOTheme
} from '@pagopa/io-app-design-system';
import { Fragment, useMemo } from 'react';
import { View } from 'react-native';
import I18n from 'i18next';
import { StoredCredential } from '../../utils/types';
import { getCredentialStatus } from '../../utils/itwCredentialStatusUtils';
import { parseClaims } from '../../utils/claims';
import { WellKnownClaim } from '../../utils/itwClaimsUtils';
import { ItwCredentialClaim } from '../credential/ItwCredentialClaim';
import { ItwIssuanceMetadata } from '../ItwIssuanceMetadata';
import { ItwQrCodeClaimImage } from '../credential/ItwQrCodeClaimImage';
import { useAppDispatch, useAppSelector } from '../../../../store';
import {
  itwIsClaimValueHiddenSelector,
  itwSetClaimValuesHidden
} from '../../store/credentials';

type ItwPresentationClaimsSectionProps = {
  credential: StoredCredential;
};

export const ItwPresentationClaimsSection = ({
  credential
}: ItwPresentationClaimsSectionProps) => {
  const theme = useIOTheme();

  const credentialStatus = useMemo(
    () => getCredentialStatus(credential),
    [credential]
  );

  const claims = parseClaims(credential.parsedCredential, {
    exclude: [WellKnownClaim.unique_id, WellKnownClaim.content]
  });

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
      {claims.map((claim, index) => {
        if (claim.id === WellKnownClaim.link_qr_code) {
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
