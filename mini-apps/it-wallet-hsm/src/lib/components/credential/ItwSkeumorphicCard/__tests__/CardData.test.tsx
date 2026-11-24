import { render } from '@testing-library/react-native';

import { parseClaimsToRecord } from '../../../../utils/claims';
import { ItwStoredCredentialsMocks } from '../../../../utils/itwMocksUtils';
import { CardData } from '../CardData';

jest.mock('@shopify/react-native-skia', () => ({
  Canvas: jest.fn(),
  Skia: {
    Data: {
      fromBase64: jest.fn()
    },
    Image: {
      MakeImageFromEncoded: jest.fn()
    }
  }
}));

describe('CardData', () => {
  it('should match snapshot for MDL front data', () => {
    const component = render(
      <CardData
        claims={parseClaimsToRecord(
          ItwStoredCredentialsMocks.mdl.parsedCredential
        )}
        credential={ItwStoredCredentialsMocks.mdl}
        side="front"
        valuesHidden={false}
      />
    );

    expect(component.queryByTestId('mdlFrontDataTestID')).toBeTruthy();
    expect(component).toMatchSnapshot();
  });

  it('should match snapshot for MDL back data', () => {
    const component = render(
      <CardData
        claims={parseClaimsToRecord(
          ItwStoredCredentialsMocks.mdl.parsedCredential
        )}
        credential={ItwStoredCredentialsMocks.mdl}
        side="back"
        valuesHidden={false}
      />
    );

    expect(component.queryByTestId('mdlBackDataTestID')).toBeTruthy();
    expect(component).toMatchSnapshot();
  });

  it('should match snapshot for DC front data', () => {
    const component = render(
      <CardData
        claims={parseClaimsToRecord(
          ItwStoredCredentialsMocks.dc.parsedCredential
        )}
        credential={ItwStoredCredentialsMocks.dc}
        side="front"
        valuesHidden={false}
      />
    );

    expect(component.queryByTestId('dcFrontDataTestID')).toBeTruthy();
    expect(component).toMatchSnapshot();
  });

  it('should match snapshot for DC back data', () => {
    const component = render(
      <CardData
        claims={parseClaimsToRecord(
          ItwStoredCredentialsMocks.dc.parsedCredential
        )}
        credential={ItwStoredCredentialsMocks.dc}
        side="back"
        valuesHidden={false}
      />
    );

    expect(component.queryByTestId('dcBackDataTestID')).toBeTruthy();
    expect(component).toMatchSnapshot();
  });
});
