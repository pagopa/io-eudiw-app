import { ElementType, Fragment, memo } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  CredentialsKeys,
  wellKnownCredential,
  wellKnownCredentialNamespaces
} from '../../../utils/credentials';
import { QrCodeImage } from '../../QrCodeImage';
import {
  claimType,
  DrivingPrivilegesClaimType,
  ParsedClaimsRecord
} from '../../../utils/claims';
import { StoredCredential } from '../../../utils/itwTypesUtils';
import { format } from '../../../utils/dates';
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
  const rows: ReadonlyArray<number> = Array.from(
    { length: 6 },
    (_, i) => row + rowStep * i
  );
  const cols: ReadonlyArray<number> = [34, 57.5];

  return (
    <View testID="mdlFrontDataTestID" style={styles.container}>
      <CardClaim
        claim={getClaim(claims, 'portrait', 'DRIVING_LICENSE')}
        position={{ left: '4%', top: '30%' }}
        dimensions={{
          width: '22.5%',
          aspectRatio: 77 / 93 // This aspect ration was extracted from the Figma design
        }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={getClaim(claims, 'family_name', 'DRIVING_LICENSE')}
        position={{ left: `${cols[0]}%`, top: `${rows[0]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={getClaim(claims, 'given_name', 'DRIVING_LICENSE')}
        position={{ left: `${cols[0]}%`, top: `${rows[1]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={getClaim(claims, 'birth_date', 'DRIVING_LICENSE')}
        position={{ left: `${cols[0]}%`, top: `${rows[2]}%` }}
        dateFormat={'DD/MM/YY'}
        hidden={valuesHidden}
      />
      {/* TODO: EUDIW mDL does not contain the birth_place claim 
        <CardClaim
        claim={getClaimMdl("birth_place", claims)}
        position={{ left: `${cols[0] + 17}%`, top: `${rows[2]}%` }}
        hidden={valuesHidden}
        />
        */}
      <CardClaim
        claim={getClaim(claims, 'issue_date', 'DRIVING_LICENSE')}
        position={{ left: `${cols[0]}%`, top: `${rows[3]}%` }}
        fontWeight={'Bold'}
        dateFormat={'DD/MM/YYYY'}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={getClaim(claims, 'issuing_authority', 'DRIVING_LICENSE')}
        position={{ left: `${cols[1]}%`, top: `${rows[3]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={getClaim(claims, 'expiry_date', 'DRIVING_LICENSE')}
        position={{ left: `${cols[0]}%`, top: `${rows[4]}%` }}
        fontWeight={'Bold'}
        dateFormat={'DD/MM/YYYY'}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={getClaim(claims, 'document_number', 'DRIVING_LICENSE')}
        position={{ left: `${cols[0]}%`, top: `${rows[5]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={getClaim(claims, 'driving_privileges', 'DRIVING_LICENSE')}
        position={{ left: '8%', bottom: '17.9%' }}
        hidden={valuesHidden}
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
    privileges.map(({ vehicle_category_code, issue_date, expiry_date }) => (
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
    <View testID="mdlBackDataTestID" style={styles.container}>
      {/*
      This is the renderer of the new MDL back driving privileges data
       */}
      <CardClaimRenderer
        claim={getClaim(claims, 'driving_privileges', 'DRIVING_LICENSE').parsed}
        type="drivingPrivileges"
        component={renderData}
      />
    </View>
  );
};

const DcFrontData = ({ claims, valuesHidden }: DataComponentProps) => {
  const row = 44.5; // Row padding, defines the first row position
  const rowStep = 11.4; // Row step, defines the space between each row

  const rows: ReadonlyArray<number> = Array.from(
    { length: 5 },
    (_, i) => row + rowStep * i
  );

  return (
    <View testID="dcFrontDataTestID" style={styles.container}>
      <CardClaim
        claim={getClaim(claims, 'portrait', 'DISABILITY_CARD')}
        position={{ left: '2.55%', bottom: '1.%' }}
        dimensions={{
          width: '24.7%',
          aspectRatio: 73 / 106 // This aspect ration was extracted from the Figma design
        }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={getClaim(claims, 'given_name', 'DISABILITY_CARD')}
        position={{ right: '3.5%', top: `${rows[0]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={getClaim(claims, 'family_name', 'DISABILITY_CARD')}
        position={{ right: '3.5%', top: `${rows[1]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={getClaim(claims, 'birth_date', 'DISABILITY_CARD')}
        position={{ right: '3.5%', top: `${rows[2]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={getClaim(claims, 'document_number', 'DISABILITY_CARD')}
        position={{ right: '3.5%', top: `${rows[3]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={getClaim(claims, 'expiry_date', 'DISABILITY_CARD')}
        position={{ right: '3.5%', top: `${rows[4]}%` }}
        hidden={valuesHidden}
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

  return (
    <View testID="dcBackDataTestID" style={styles.container}>
      <CardClaimRenderer
        claim={qrCodeStringClaim}
        type={claimType.string}
        component={claim => (
          <CardClaimContainer
            position={{
              right: `7%`,
              top: `11%`
            }}
          >
            <QrCodeImage value={claim.value} size={'28.5%'} />
          </CardClaimContainer>
        )}
      />
    </View>
  );
};

const dataComponentMap: Record<
  string,
  Record<CardSide, ElementType<DataComponentProps>>
> = {
  [wellKnownCredential.DRIVING_LICENSE]: {
    front: MdlFrontData,
    back: MdlBackData
  },
  [wellKnownCredential.DISABILITY_CARD]: {
    front: DcFrontData,
    back: DcBackData
  }
};

type CardDataProps = {
  credential: StoredCredential;
  side: CardSide;
  valuesHidden: boolean;
  claims: ParsedClaimsRecord;
};

const CardData = ({
  credential,
  side,
  valuesHidden,
  claims
}: CardDataProps) => {
  const componentMap = dataComponentMap[credential.credentialType];
  const DataComponent = componentMap?.[side];
  if (!DataComponent) {
    return null;
  }

  return (
    <DataComponent
      key={`credential_data_${credential.credentialType}_${side}`}
      claims={claims}
      valuesHidden={valuesHidden}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%'
  }
});

const MemoizeCardData = memo(CardData);

export { MemoizeCardData as CardData };
