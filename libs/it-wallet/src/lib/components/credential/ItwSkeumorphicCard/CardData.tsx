import { ElementType, Fragment, memo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  claimType,
  DrivingPrivilegesClaimType,
  ParsedClaimsRecord
} from '../../../utils/claims';
import {
  CredentialsKeys,
  wellKnownCredential,
  wellKnownCredentialNamespaces
} from '../../../utils/credentials';
import { format } from '../../../utils/dates';
import { StoredCredentialMetadata } from '../../../utils/itwTypesUtils';
import { QrCodeImage } from '../../QrCodeImage';
import { CardClaim, CardClaimContainer, CardClaimRenderer } from './CardClaim';
import { ClaimLabel } from './ClaimLabel';
import { CardSide } from './types';

type DataComponentProps = {
  claims: ParsedClaimsRecord;
  valuesHidden: boolean;
};

const getClaim = (
  claims: ParsedClaimsRecord,
  key: string,
  credentialType: CredentialsKeys
) => {
  const credentialNamespace = wellKnownCredentialNamespaces[credentialType];
  const expandedKey = credentialNamespace
    ? `${credentialNamespace}:${key}`
    : key;
  return claims[expandedKey];
};

const MdlFrontData = ({ claims, valuesHidden }: DataComponentProps) => {
  const row = 11.6; // Row padding, defines the first row position
  const rowStep = 6.9; // Row step, defines the space between each row
  const rows: readonly number[] = Array.from(
    { length: 6 },
    (_, i) => row + rowStep * i
  );
  const cols: readonly number[] = [34, 57.5];

  return (
    <View style={styles.container} testID="mdlFrontDataTestID">
      <CardClaim
        claim={getClaim(claims, 'portrait', 'DRIVING_LICENSE')}
        dimensions={{
          aspectRatio: 77 / 93, // This aspect ration was extracted from the Figma design
          width: '22.5%'
        }}
        hidden={valuesHidden}
        position={{ left: '4%', top: '30%' }}
      />
      <CardClaim
        claim={getClaim(claims, 'family_name', 'DRIVING_LICENSE')}
        hidden={valuesHidden}
        position={{ left: `${cols[0]}%`, top: `${rows[0]}%` }}
      />
      <CardClaim
        claim={getClaim(claims, 'given_name', 'DRIVING_LICENSE')}
        hidden={valuesHidden}
        position={{ left: `${cols[0]}%`, top: `${rows[1]}%` }}
      />
      <CardClaim
        claim={getClaim(claims, 'birth_date', 'DRIVING_LICENSE')}
        dateFormat={'DD/MM/YY'}
        hidden={valuesHidden}
        position={{ left: `${cols[0]}%`, top: `${rows[2]}%` }}
      />
      <CardClaim
        claim={getClaim(claims, 'birth_place', 'DRIVING_LICENSE')}
        hidden={valuesHidden}
        position={{ left: `${cols[0] + 17}%`, top: `${rows[2]}%` }}
      />
      <CardClaim
        claim={getClaim(claims, 'issue_date', 'DRIVING_LICENSE')}
        dateFormat={'DD/MM/YYYY'}
        fontWeight={'Bold'}
        hidden={valuesHidden}
        position={{ left: `${cols[0]}%`, top: `${rows[3]}%` }}
      />
      <CardClaim
        claim={getClaim(claims, 'issuing_authority', 'DRIVING_LICENSE')}
        hidden={valuesHidden}
        position={{ left: `${cols[1]}%`, top: `${rows[3]}%` }}
      />
      <CardClaim
        claim={getClaim(claims, 'expiry_date', 'DRIVING_LICENSE')}
        dateFormat={'DD/MM/YYYY'}
        fontWeight={'Bold'}
        hidden={valuesHidden}
        position={{ left: `${cols[0]}%`, top: `${rows[4]}%` }}
      />
      <CardClaim
        claim={getClaim(claims, 'document_number', 'DRIVING_LICENSE')}
        hidden={valuesHidden}
        position={{ left: `${cols[0]}%`, top: `${rows[5]}%` }}
      />
      <CardClaim
        claim={getClaim(claims, 'driving_privileges', 'DRIVING_LICENSE')}
        hidden={valuesHidden}
        position={{ bottom: '17.9%', left: '8%' }}
      />
    </View>
  );
};

const MdlBackData = ({ claims, valuesHidden }: DataComponentProps) => {
  // Driving privilges list with the same order as on the Driving License physical card
  const drivingPrivileges = [
    'AM',
    'A1',
    'A2',
    'A',
    'B1',
    'B',
    'C1',
    'C',
    'D1',
    'D',
    'BE',
    'C1E',
    'CE',
    'D1E',
    'DE'
  ] as const;

  const row = 6.8; // Row padding, defines the first row position
  const rowStep = 4.7; // Row step, defines the space between each row
  // This object definies the rows of the driving privileges table, specifing the "y" coordinate for each item
  const privilegesTableRows: Record<string, number> = drivingPrivileges.reduce(
    (acc, privilege, index) => ({
      ...acc,
      [privilege]: row + rowStep * index
    }),
    {} as Record<string, number>
  );

  const renderData = ({ value: privileges }: DrivingPrivilegesClaimType) =>
    privileges.map(({ expiry_date, issue_date, vehicle_category_code }) => (
      <Fragment key={`driving_privilege_row_${vehicle_category_code}`}>
        <CardClaimContainer
          position={{
            left: `41.5%`,
            top: `${privilegesTableRows[vehicle_category_code] || 0}%`
          }}
        >
          <ClaimLabel fontSize={9} hidden={valuesHidden}>
            {format(issue_date, 'DD/MM/YY')}
          </ClaimLabel>
        </CardClaimContainer>
        <CardClaimContainer
          key={`driving_privilege_${vehicle_category_code}`}
          position={{
            left: `55%`,
            top: `${privilegesTableRows[vehicle_category_code] || 0}%`
          }}
        >
          <ClaimLabel fontSize={9} hidden={valuesHidden}>
            {format(expiry_date, 'DD/MM/YY')}
          </ClaimLabel>
        </CardClaimContainer>
      </Fragment>
    ));

  return (
    <View style={styles.container} testID="mdlBackDataTestID">
      {/*
      This is the renderer of the new MDL back driving privileges data
       */}
      <CardClaimRenderer
        claim={getClaim(claims, 'driving_privileges', 'DRIVING_LICENSE').parsed}
        component={renderData}
        type="drivingPrivileges"
      />
    </View>
  );
};

const DcFrontData = ({ claims, valuesHidden }: DataComponentProps) => {
  const row = 44.5; // Row padding, defines the first row position
  const rowStep = 11.4; // Row step, defines the space between each row

  const rows: readonly number[] = Array.from(
    { length: 5 },
    (_, i) => row + rowStep * i
  );

  return (
    <View style={styles.container} testID="dcFrontDataTestID">
      <CardClaim
        claim={getClaim(claims, 'portrait', 'DISABILITY_CARD')}
        dimensions={{
          aspectRatio: 73 / 106, // This aspect ration was extracted from the Figma design
          width: '24.7%'
        }}
        hidden={valuesHidden}
        position={{ bottom: '1.%', left: '2.55%' }}
      />
      <CardClaim
        claim={getClaim(claims, 'given_name', 'DISABILITY_CARD')}
        hidden={valuesHidden}
        position={{ right: '3.5%', top: `${rows[0]}%` }}
      />
      <CardClaim
        claim={getClaim(claims, 'family_name', 'DISABILITY_CARD')}
        hidden={valuesHidden}
        position={{ right: '3.5%', top: `${rows[1]}%` }}
      />
      <CardClaim
        claim={getClaim(claims, 'birth_date', 'DISABILITY_CARD')}
        hidden={valuesHidden}
        position={{ right: '3.5%', top: `${rows[2]}%` }}
      />
      <CardClaim
        claim={getClaim(claims, 'document_number', 'DISABILITY_CARD')}
        hidden={valuesHidden}
        position={{ right: '3.5%', top: `${rows[3]}%` }}
      />
      <CardClaim
        claim={getClaim(claims, 'expiry_date', 'DISABILITY_CARD')}
        hidden={valuesHidden}
        position={{ right: '3.5%', top: `${rows[4]}%` }}
      />
    </View>
  );
};

const DcBackData = ({ claims }: DataComponentProps) => {
  const qrCodeClaim = getClaim(
    claims,
    'link_qr_code',
    'DISABILITY_CARD'
  ).parsed;

  const qrCodeStringClaim =
    qrCodeClaim?.type === claimType.string ? qrCodeClaim : undefined;

  const [width, setWidth] = useState(0);

  return (
    <View style={styles.container} testID="dcBackDataTestID">
      <CardClaimRenderer
        claim={qrCodeStringClaim}
        component={claim => (
          <CardClaimContainer
            dimensions={{ aspectRatio: '1/1', width: '32%' }}
            onLayout={ev => {
              setWidth(ev.nativeEvent.layout.width);
            }}
            position={{
              right: '6%',
              top: '10%'
            }}
          >
            <QrCodeImage size={width} value={claim.value} />
          </CardClaimContainer>
        )}
        type={claimType.string}
      />
    </View>
  );
};

const dataComponentMap: Record<
  string,
  Record<CardSide, ElementType<DataComponentProps>>
> = {
  [wellKnownCredential.DISABILITY_CARD]: {
    back: DcBackData,
    front: DcFrontData
  },
  [wellKnownCredential.DRIVING_LICENSE]: {
    back: MdlBackData,
    front: MdlFrontData
  }
};

type CardDataProps = {
  claims: ParsedClaimsRecord;
  credential: StoredCredentialMetadata;
  side: CardSide;
  valuesHidden: boolean;
};

const CardData = ({
  claims,
  credential,
  side,
  valuesHidden
}: CardDataProps) => {
  const componentMap = dataComponentMap[credential.credentialType];
  const DataComponent = componentMap?.[side];
  if (!DataComponent) {
    return null;
  }

  return (
    <DataComponent
      claims={claims}
      key={`credential_data_${credential.credentialType}_${side}`}
      valuesHidden={valuesHidden}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    position: 'absolute',
    width: '100%'
  }
});

const MemoizeCardData = memo(CardData);

export { MemoizeCardData as CardData };
