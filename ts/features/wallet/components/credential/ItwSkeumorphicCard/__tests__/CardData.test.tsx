import { render } from '@testing-library/react-native';
import { parseClaimsToRecord } from '../../../../utils/claims';
import { ItwStoredCredentialsMocks } from '../../../../utils/itwMocksUtils';
import { CardData } from '../CardData';

jest.mock('@shopify/react-native-skia', () => ({
  Skia: {
    Data: {
      fromBase64: jest.fn()
    },
    Image: {
      MakeImageFromEncoded: jest.fn()
    }
  },
  Canvas: jest.fn()
}));

describe('CardData', () => {
  it('should match snapshot for MDL front data', () => {
    const component = render(
      <CardData
        credential={ItwStoredCredentialsMocks.mdl}
        claims={parseClaimsToRecord(
          ItwStoredCredentialsMocks.mdl.parsedCredential
        )}
        side="front"
        mode="vertical"
        valuesHidden={false}
      />
    );

    expect(component.queryByTestId('mdlFrontDataTestID')).toBeTruthy();
    expect(component).toMatchSnapshot();
  });

  it('should match snapshot for MDL back data', () => {
    const component = render(
      <CardData
        credential={ItwStoredCredentialsMocks.mdl}
        claims={parseClaimsToRecord(
          ItwStoredCredentialsMocks.mdl.parsedCredential
        )}
        side="back"
        mode="vertical"
        valuesHidden={false}
      />
    );

    expect(component.queryByTestId('mdlBackDataTestID')).toBeTruthy();
    expect(component).toMatchSnapshot();
  });

  it('should match snapshot for DC front data', () => {
    const component = render(
      <CardData
        credential={ItwStoredCredentialsMocks.dc}
        claims={parseClaimsToRecord(
          ItwStoredCredentialsMocks.dc.parsedCredential
        )}
        side="front"
        mode="vertical"
        valuesHidden={false}
      />
    );

    expect(component.queryByTestId('dcFrontDataTestID')).toBeTruthy();
    expect(component).toMatchSnapshot();
  });

  it('should match snapshot for DC back data', () => {
    const component = render(
      <CardData
        credential={ItwStoredCredentialsMocks.dc}
        claims={parseClaimsToRecord(
          ItwStoredCredentialsMocks.dc.parsedCredential
        )}
        side="back"
        mode="vertical"
        valuesHidden={false}
      />
    );

    expect(component.queryByTestId('dcBackDataTestID')).toBeTruthy();
    expect(component).toMatchSnapshot();
  });
});
