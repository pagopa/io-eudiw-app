import { createStackNavigator } from '@react-navigation/stack';

import CredentialAlreadyObtained from '../../screens/credentialIssuance/CredentialAlreadyObtained';
import CredentialFailure from '../../screens/credentialIssuance/CredentialFailure';
import CredentialIntroduction, {
  CredentialIntroductionParams
} from '../../screens/credentialIssuance/CredentialIntroduction';
import { CredentialPreview } from '../../screens/credentialIssuance/CredentialIssuancePreview';
import CredentialsList from '../../screens/credentialIssuance/CredentialsList';
import CredentialTrust from '../../screens/credentialIssuance/CredentialTrust';
import ResolvedCredentialOffer, {
  CredentialOfferParams
} from '../../screens/deeplink/CredentialOffer';
import CREDENTIAL_ISSUANCE_ROUTES from './routes';

export type CredentialIssuanceNavigatorParamsList = {
  [CREDENTIAL_ISSUANCE_ROUTES.ALREADY_OBTAINED]: undefined;
  [CREDENTIAL_ISSUANCE_ROUTES.FAILURE]: undefined;
  [CREDENTIAL_ISSUANCE_ROUTES.INTRODUCTION]: CredentialIntroductionParams;
  [CREDENTIAL_ISSUANCE_ROUTES.LIST]: undefined;
  [CREDENTIAL_ISSUANCE_ROUTES.OFFER]: CredentialOfferParams;
  [CREDENTIAL_ISSUANCE_ROUTES.PREVIEW]: undefined;
  [CREDENTIAL_ISSUANCE_ROUTES.TRUST]: undefined;
};

const Stack = createStackNavigator<CredentialIssuanceNavigatorParamsList>();

/**
 * Stack of the credential issuance flow, started either from the credentials
 * catalogue or from a credential offer.
 */
const CredentialIssuanceNavigator = () => (
  <Stack.Navigator initialRouteName={CREDENTIAL_ISSUANCE_ROUTES.LIST}>
    <Stack.Screen
      component={CredentialsList}
      name={CREDENTIAL_ISSUANCE_ROUTES.LIST}
    />
    <Stack.Screen
      component={ResolvedCredentialOffer}
      name={CREDENTIAL_ISSUANCE_ROUTES.OFFER}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      component={CredentialIntroduction}
      name={CREDENTIAL_ISSUANCE_ROUTES.INTRODUCTION}
    />
    <Stack.Screen
      component={CredentialTrust}
      name={CREDENTIAL_ISSUANCE_ROUTES.TRUST}
    />
    <Stack.Screen
      component={CredentialPreview}
      name={CREDENTIAL_ISSUANCE_ROUTES.PREVIEW}
    />
    <Stack.Screen
      component={CredentialFailure}
      name={CREDENTIAL_ISSUANCE_ROUTES.FAILURE}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      component={CredentialAlreadyObtained}
      name={CREDENTIAL_ISSUANCE_ROUTES.ALREADY_OBTAINED}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

export default CredentialIssuanceNavigator;
