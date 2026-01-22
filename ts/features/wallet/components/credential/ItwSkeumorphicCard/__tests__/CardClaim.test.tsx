import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { CardClaim, CardClaimRenderer } from '../CardClaim';

describe('CardClaim', () => {
  it('should return null if claim is not decoded correctly', () => {
    const { queryByTestId } = render(
      <CardClaim
        testID="claimTestID"
        claim={{ label: 'test', parsed: undefined }}
      />
    );

    expect(queryByTestId('claimTestID')).toBeFalsy();
  });

  it('should render correctly if claim is successfully decoded', () => {
    const { queryByText, queryByTestId } = render(
      <CardClaim
        testID="claimTestID"
        claim={{
          label: 'test',
          parsed: { type: 'string', value: 'Some string' }
        }}
      />
    );

    expect(queryByText('Some string')).toBeTruthy();
    expect(queryByTestId('claimTestID')).toBeTruthy();
  });
});

describe('CardClaimRenderer', () => {
  it('should correctly render a string claim', () => {
    const { queryByTestId, queryByText } = render(
      <CardClaimRenderer
        claim={{ type: 'string', value: 'Some string' }}
        type={'string'}
        component={decoded => <Text testID="claimTestID">{decoded.value}</Text>}
      />
    );

    expect(queryByText('Some string')).toBeTruthy();
    expect(queryByTestId('claimTestID')).toBeTruthy();
  });

  it('should correctly render a driving privilege claim', () => {
    const { queryByTestId, queryByText } = render(
      <CardClaimRenderer
        claim={{
          type: 'drivingPrivileges',
          value: [
            {
              vehicle_category_code: 'AM',
              issue_date: '1935-01-23',
              expiry_date: '2035-02-16'
            },
            {
              vehicle_category_code: 'B',
              issue_date: '1935-01-23',
              expiry_date: '2035-02-16'
            }
          ]
        }}
        type="drivingPrivileges"
        component={decoded =>
          decoded.value.map(p => (
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
