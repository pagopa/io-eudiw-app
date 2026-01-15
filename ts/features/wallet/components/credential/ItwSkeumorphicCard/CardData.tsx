import { ElementType, Fragment, memo } from 'react';
import { StyleSheet, View } from 'react-native';
import z from 'zod';
import { ParsedCredential, StoredCredential } from '../../../utils/types';
import {
  baseClaimSchemaExtracted,
  DrivingPrivilegesClaimType,
  drivingPrivilegesSchema
} from '../../../utils/claims';
import { QrCodeImage } from '../../QrCodeImage';
import { wellKnownCredential } from '../../../utils/credentials';
import { getClaimsFullLocale } from '../../../utils/locale';
import { format } from '../../../utils/dates';
import { CardSide } from './types';
import { ClaimLabel } from './ClaimLabel';
import { CardClaim, CardClaimContainer, CardClaimRenderer } from './CardClaim';

type DataComponentProps = {
  claims: ParsedCredential;
  valuesHidden: boolean;
};

const getClaimMdl = (claimName: string, claims: ParsedCredential) => {
  const extendedClaimName = `org.iso.18013.5.1:${claimName}`;
  const claim = claims[extendedClaimName];
  const attributeName =
    typeof claim?.name === 'string'
      ? claim.name
      : claim?.name?.[getClaimsFullLocale()] || extendedClaimName;

  return { label: attributeName, value: claim.value, id: extendedClaimName };
};

const getClaimDc = (claimName: string, claims: ParsedCredential) => {
  const claim = claims[claimName];
  const attributeName =
    typeof claim?.name === 'string'
      ? claim.name
      : claim?.name?.[getClaimsFullLocale()] || claimName;

  return { label: attributeName, value: claim?.value, id: claimName };
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
        claim={getClaimMdl('portrait', claims)}
        position={{ left: '4%', top: '30%' }}
        dimensions={{
          width: '22.5%',
          aspectRatio: 77 / 93 // This aspect ration was extracted from the Figma design
        }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={getClaimMdl('family_name', claims)}
        position={{ left: `${cols[0]}%`, top: `${rows[0]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={getClaimMdl('given_name', claims)}
        position={{ left: `${cols[0]}%`, top: `${rows[1]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={getClaimMdl('birth_date', claims)}
        position={{ left: `${cols[0]}%`, top: `${rows[2]}%` }}
        dateFormat="DD/MM/YY"
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
        claim={getClaimMdl('issue_date', claims)}
        position={{ left: `${cols[0]}%`, top: `${rows[3]}%` }}
        fontWeight={'Bold'}
        dateFormat={'DD/MM/YYYY'}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={getClaimMdl('issuing_authority', claims)}
        position={{ left: `${cols[1]}%`, top: `${rows[3]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={getClaimMdl('expiry_date', claims)}
        position={{ left: `${cols[0]}%`, top: `${rows[4]}%` }}
        fontWeight={'Bold'}
        dateFormat={'DD/MM/YYYY'}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={getClaimMdl('document_number', claims)}
        position={{ left: `${cols[0]}%`, top: `${rows[5]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={getClaimMdl('driving_privileges', claims)}
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

  const renderData = (privileges: DrivingPrivilegesClaimType['value']) =>
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
        claim={getClaimMdl('driving_privileges', claims)}
        parser={baseClaimSchemaExtracted.pipe(
          drivingPrivilegesSchema.transform(({ value }) => value)
        )}
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
        claim={getClaimDc('portrait', claims)}
        position={{ left: '2.55%', bottom: '1.%' }}
        dimensions={{
          width: '24.7%',
          aspectRatio: 73 / 106 // This aspect ration was extracted from the Figma design
        }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={getClaimDc('given_name', claims)}
        position={{ right: '3.5%', top: `${rows[0]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={getClaimDc('family_name', claims)}
        position={{ right: '3.5%', top: `${rows[1]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={getClaimDc('birth_date', claims)}
        position={{ right: '3.5%', top: `${rows[2]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={getClaimDc('document_number', claims)}
        position={{ right: '3.5%', top: `${rows[3]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={getClaimDc('expiry_date', claims)}
        position={{ right: '3.5%', top: `${rows[4]}%` }}
        hidden={valuesHidden}
      />
    </View>
  );
};

const DcBackData = ({ claims }: DataComponentProps) => (
  <View testID="dcBackDataTestID" style={styles.container}>
    <CardClaimRenderer
      claim={getClaimDc('link_qr_code', claims)}
      parser={baseClaimSchemaExtracted.pipe(z.string())}
      component={qrCode => (
        <CardClaimContainer
          position={{
            right: `6%`,
            top: `10%`
          }}
        >
          <QrCodeImage value={qrCode} size={'28.5%'} />
        </CardClaimContainer>
      )}
    />
  </View>
);

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
};

const CardData = ({ credential, side, valuesHidden }: CardDataProps) => {
  const credentialComponents = dataComponentMap[credential.credentialType];

  if (!credentialComponents) {
    return null;
  }

  const DataComponent = credentialComponents[side];

  if (!DataComponent) {
    return null;
  }

  return (
    <DataComponent
      key={`credential_data_${credential.credentialType}_${side}`}
      claims={credential.parsedCredential}
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
