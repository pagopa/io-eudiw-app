import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { CardClaim, CardClaimRenderer } from '../CardClaim';

describe('CardClaim', () => {
  it('should return null if claim is not decoded correctly', () => {
    const { queryByTestId } = render(
      <CardClaim
        claim={{ label: 'test', parsed: undefined }}
        testID="claimTestID"
      />
    );

    expect(queryByTestId('claimTestID')).toBeFalsy();
  });

  it('should render correctly if claim is successfully decoded', () => {
    const { queryByTestId, queryByText } = render(
      <CardClaim
        claim={{
          label: 'test',
          parsed: { type: 'string', value: 'Some string' }
        }}
        testID="claimTestID"
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
        component={decoded => <Text testID="claimTestID">{decoded.value}</Text>}
        type={'string'}
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
              expiry_date: '2035-02-16',
              issue_date: '1935-01-23',
              vehicle_category_code: 'AM'
            },
            {
              expiry_date: '2035-02-16',
              issue_date: '1935-01-23',
              vehicle_category_code: 'B'
            }
          ]
        }}
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
        type="drivingPrivileges"
      />
    );

    expect(queryByText('AM')).toBeTruthy();
    expect(queryByText('B')).toBeTruthy();
    expect(queryByTestId('claimTestID_AM')).toBeTruthy();
    expect(queryByTestId('claimTestID_B')).toBeTruthy();
  });
});
