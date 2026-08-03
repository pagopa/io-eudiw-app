import {
  Divider,
  H6,
  IconButton,
  useIOTheme
} from '@pagopa/io-app-design-system';
import { Fragment, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useAppDispatch, useAppSelector } from '../../store';
import {
  itwIsClaimValueHiddenSelector,
  itwSetClaimValuesHidden
} from '../../store/credentials';
import { ParsedClaimsRecord } from '../../utils/claims';
import { WellKnownClaim } from '../../utils/itwClaimsUtils';
import { getCredentialStatus } from '../../utils/itwCredentialStatusUtils';
import { StoredCredentialMetadata } from '../../utils/itwTypesUtils';
import { ItwCredentialClaim } from '../credential/ItwCredentialClaim';
import { ItwQrCodeClaimImage } from '../credential/ItwQrCodeClaimImage';
import { ItwBarcodeCard } from '../ItwBarcodeCard';
import { ItwIssuanceMetadata } from '../ItwIssuanceMetadata';

type ItwPresentationClaimsSectionProps = {
  credential: StoredCredentialMetadata;
  parsedClaims: ParsedClaimsRecord;
};

export const ItwPresentationClaimsSection = ({
  credential,
  parsedClaims
}: ItwPresentationClaimsSectionProps) => {
  const theme = useIOTheme();
  const { t } = useTranslation(['common']);

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
      accessibilityLabel={t(
        'presentation.credentialDetails.actions.hideClaimValues',
        {
          ns: 'wallet'
        }
      )}
      accessibilityRole="switch"
      accessibilityState={{ checked: valuesHidden }}
      accessible={true}
    >
      <IconButton
        accessibilityLabel={t(
          'presentation.credentialDetails.actions.hideClaimValues',
          {
            ns: 'wallet'
          }
        )}
        icon={valuesHidden ? 'eyeHide' : 'eyeShow'}
        onPress={handleToggleClaimVisibility}
        testID="toggle-claim-visibility"
      />
    </View>
  );

  const claims = Object.entries(parsedClaims);
  const filteredClaims = useMemo(
    () =>
      claims.filter(
        ([id]) =>
          id !== WellKnownClaim.link_qr_code && id !== WellKnownClaim.barcode
      ),
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

  const BarcodeCard = useCallback(() => {
    const barcodeClaim = claims.find(
      ([id]) => id === WellKnownClaim.barcode
    )?.[1];

    if (
      !barcodeClaim?.parsed?.value ||
      typeof barcodeClaim.parsed.value !== 'string'
    ) {
      return null;
    }

    return <ItwBarcodeCard value={barcodeClaim.parsed.value} />;
  }, [claims]);

  return (
    <View>
      {
        // If do not have claims, we should not render the title and the toggle
        claims.length > 0 && (
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <H6 color={theme['textHeading-tertiary']}>
              {t('presentation.credentialDetails.documentDataTitle', {
                ns: 'wallet'
              })}
            </H6>
            {renderHideValuesToggle()}
          </View>
        )
      }
      <LinkQrCode />
      <BarcodeCard />
      {filteredClaims.map(([id, claim], index) => {
        if (id === WellKnownClaim.link_qr_code) {
          // Since the `link_qr_code` claim  difficult to distinguish from a generic image claim, we need to manually
          // check for the claim and render it accordingly
          return <ItwQrCodeClaimImage claim={claim} key={index} />;
        }

        return (
          <Fragment key={index}>
            {index !== 0 && <Divider />}
            <ItwCredentialClaim
              claim={claim}
              clipboardSuccessMessage={t('clipboard.copyFeedback')}
              credentialStatus={credentialStatus}
              hidden={valuesHidden}
              isPreview={false}
              showLabel={t('buttons.show')}
            />
          </Fragment>
        );
      })}
      {claims.length > 0 && <Divider />}
      <ItwIssuanceMetadata credential={credential} isPreview={false} />
    </View>
  );
};
