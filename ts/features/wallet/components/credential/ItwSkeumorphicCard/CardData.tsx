import { ElementType, Fragment, memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { wellKnownCredential } from '../../../utils/credentials';
import { QrCodeImage } from '../../QrCodeImage';
import {
  ClaimScheme,
  claimType,
  ParsedClaimsRecord
} from '../../../utils/claims';
import { StoredCredential } from '../../../utils/itwTypesUtils';
import { CardSide } from './CardBackground';
import { CardClaim, CardClaimContainer, CardClaimRenderer } from './CardClaim';
import { ClaimLabel } from './ClaimLabel';

type DataComponentProps = {
  claims: ParsedClaimsRecord;
  valuesHidden: boolean;
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
        claim={claims.family_name}
        position={{ left: '4%', top: '30%' }}
        dimensions={{
          width: '22.5%',
          aspectRatio: 77 / 93 // This aspect ration was extracted from the Figma design
        }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={claims.portrait}
        position={{ left: `${cols[0]}%`, top: `${rows[0]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={claims.given_name}
        position={{ left: `${cols[0]}%`, top: `${rows[1]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={claims.birth_date}
        position={{ left: `${cols[0]}%`, top: `${rows[2]}%` }}
        dateFormat={'DD/MM/YY'}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={claims.birth_place}
        position={{ left: `${cols[0] + 17}%`, top: `${rows[2]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={claims.issue_date}
        position={{ left: `${cols[0]}%`, top: `${rows[3]}%` }}
        fontWeight={'Bold'}
        dateFormat={'DD/MM/YYYY'}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={claims.issuing_authority}
        position={{ left: `${cols[1]}%`, top: `${rows[3]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={claims.expiry_date}
        position={{ left: `${cols[0]}%`, top: `${rows[4]}%` }}
        fontWeight={'Bold'}
        dateFormat={'DD/MM/YYYY'}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={claims.document_number}
        position={{ left: `${cols[0]}%`, top: `${rows[5]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={claims.driving_privileges}
        position={{ left: '8%', bottom: '17.9%' }}
        hidden={valuesHidden}
      />
    </View>
  );
};

const MdlBackData = ({ claims, valuesHidden }: DataComponentProps) => {
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

  const row = 6.8;
  const rowStep = 4.7;
  const privilegesTableRows: Record<string, number> = drivingPrivileges.reduce(
    (acc, privilege, index) => ({
      ...acc,
      [privilege]: row + rowStep * index
    }),
    {} as Record<string, number>
  );

  const drivingPrivilegesClaim =
    claims.driving_privileges.parsed ??
    claims.driving_privileges_details.parsed;

  const drivingPrivilegesOnly =
    drivingPrivilegesClaim?.type === claimType.drivingPrivileges
      ? drivingPrivilegesClaim
      : undefined;

  const renderData = (claim: ClaimScheme & { type: 'drivingPrivileges' }) => (
    <>
      {claim.value.map(
        ({
          vehicle_category_code,
          issue_date,
          expiry_date,
          restrictions_conditions
        }: {
          vehicle_category_code: string;
          issue_date: string;
          expiry_date: string;
          restrictions_conditions?: string;
        }) => (
          <Fragment key={`driving_privilege_row_${vehicle_category_code}`}>
            <CardClaimContainer
              position={{
                left: `41.5%`,
                top: `${privilegesTableRows[vehicle_category_code] || 0}%`
              }}
            >
              <ClaimLabel fontSize={9} hidden={valuesHidden}>
                {issue_date}
              </ClaimLabel>
            </CardClaimContainer>

            <CardClaimContainer
              position={{
                left: `55%`,
                top: `${privilegesTableRows[vehicle_category_code] || 0}%`
              }}
            >
              <ClaimLabel fontSize={9} hidden={valuesHidden}>
                {expiry_date}
              </ClaimLabel>
            </CardClaimContainer>

            {restrictions_conditions && (
              <CardClaimContainer
                position={{
                  left: `68.5%`,
                  top: `${privilegesTableRows[vehicle_category_code] || 0}%`
                }}
              >
                <ClaimLabel fontSize={9}>{restrictions_conditions}</ClaimLabel>
              </CardClaimContainer>
            )}
          </Fragment>
        )
      )}
    </>
  );
  return (
    <View testID="mdlBackDataTestID" style={styles.container}>
      {/*
      This is the renderer of the new MDL back driving privileges data
       */}
      {/*
      This is the renderer of the old MDL back driving privileges data
      TODO: remove this when the old MDL will not be supported anymore
       */}
      <CardClaimRenderer
        claim={drivingPrivilegesOnly}
        type={claimType.drivingPrivileges}
        component={renderData}
      />

      <CardClaim
        claim={claims.restrictions_conditions}
        position={{ left: '8%', bottom: '6.5%' }}
        fontSize={9}
        hidden={valuesHidden}
      />
    </View>
  );
};

const DcFrontData = ({ claims, valuesHidden }: DataComponentProps) => {
  const row = 44.5;
  const rowStep = 11.4;

  const rows: ReadonlyArray<number> = Array.from(
    { length: 5 },
    (_, i) => row + rowStep * i
  );

  return (
    <View testID="dcFrontDataTestID" style={styles.container}>
      <CardClaim
        claim={claims.portrait}
        position={{ left: '2.55%', bottom: '1.%' }}
        dimensions={{
          width: '24.7%',
          aspectRatio: 73 / 106
        }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={claims.given_name}
        position={{ right: '3.5%', top: `${rows[0]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={claims.family_name}
        position={{ right: '3.5%', top: `${rows[1]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={claims.birth_date}
        position={{ right: '3.5%', top: `${rows[2]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={claims.document_number}
        position={{ right: '3.5%', top: `${rows[3]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={claims.expiry_date}
        position={{ right: '3.5%', top: `${rows[4]}%` }}
        hidden={valuesHidden}
      />
    </View>
  );
};

const DcBackData = ({ claims }: DataComponentProps) => {
  const qrCodeClaim = claims.link_qr_code.parsed;

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
