import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import z from 'zod';
import { CardClaim, CardClaimRenderer } from '../CardClaim';
import {
  baseClaimSchemaExtracted,
  DrivingPrivilegesClaimType,
  drivingPrivilegesSchema,
  pdfSchema
} from '../../../../utils/claims';

describe('CardClaim', () => {
  it('should return null if claim is not decoded correctly', () => {
    const { queryByTestId } = render(
      <CardClaim
        testID="claimTestID"
        claim={{ label: 'test', value: undefined, id: 'Some id' }}
      />
    );

    expect(queryByTestId('claimTestID')).toBeFalsy();
  });

  it('should render correctly if claim is successfully decoded', () => {
    const { queryByText, queryByTestId } = render(
      <CardClaim
        testID="claimTestID"
        claim={{ label: 'test', value: 'Some string', id: 'Some id' }}
      />
    );

    expect(queryByText('Some string')).toBeTruthy();
    expect(queryByTestId('claimTestID')).toBeTruthy();
  });
});

describe('CardClaimRenderer', () => {
  it('should return null if claim is not decoded correctly', () => {
    const { queryByTestId, queryByText } = render(
      <CardClaimRenderer
        claim={{ label: 'test', value: 'Some string', id: 'Some id' }}
        parser={pdfSchema.transform(({ value }) => value)}
        component={() => (
          <Text testID="claimTestID">This should not be rendered!</Text>
        )}
      />
    );

    expect(queryByTestId('claimTestID')).toBeFalsy();
    expect(queryByText('This should not be rendered!')).toBeFalsy();
  });

  it('should correctly render a string claim', () => {
    const { queryByTestId, queryByText } = render(
      <CardClaimRenderer
        claim={{ label: 'test', value: 'Some string', id: 'Some id' }}
        parser={baseClaimSchemaExtracted.pipe(z.string())}
        component={decoded => <Text testID="claimTestID">{decoded}</Text>}
      />
    );

    expect(queryByText('Some string')).toBeTruthy();
    expect(queryByTestId('claimTestID')).toBeTruthy();
  });

  it('should correctly render a driving privilege claim', () => {
    const { queryByTestId, queryByText } = render(
      <CardClaimRenderer
        claim={{
          label: 'test',
          value: [
            {
              vehicle_category_code: 'AM',
              issue_date: '1935-01-23',
              expiry_date: '2035-02-16',
              restrictions_conditions: ''
            },
            {
              vehicle_category_code: 'B',
              issue_date: '1935-01-23',
              expiry_date: '2035-02-16',
              restrictions_conditions: ''
            }
          ],
          id: 'Some id'
        }}
        parser={baseClaimSchemaExtracted.pipe(
          drivingPrivilegesSchema.transform(({ value }) => value)
        )}
        component={(decoded: DrivingPrivilegesClaimType['value']) =>
          decoded.map(p => (
            <Text
              key={p.vehicle_category_code}
              testID={`claimTestID_${p.vehicle_category_code}`}
            >
              {p.vehicle_category_code}
            </Text>
          ))
        }
      />
    );

    expect(queryByText('AM')).toBeTruthy();
    expect(queryByText('B')).toBeTruthy();
    expect(queryByTestId('claimTestID_AM')).toBeTruthy();
    expect(queryByTestId('claimTestID_B')).toBeTruthy();
  });
});
