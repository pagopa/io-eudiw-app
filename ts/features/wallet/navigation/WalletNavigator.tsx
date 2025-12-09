import {createNativeStackNavigator} from '@react-navigation/native-stack';
import PidIssuanceFailure from '../screens/pidIssuance/PidIssuanceFailure';
import PidIssuancRequest from '../screens/pidIssuance/PidIssuanceRequest';
import PidIssuanceSuccess from '../screens/pidIssuance/PidIssuanceSuccess';
import {
  PresentationCredentialDetailNavigationParams,
  PresentationCredentialDetails
} from '../screens/presentation/PresentationCredentialDetails';
import PresentationPreDefinition, {
  PresentationPreDefinitionParams
} from '../screens/presentation/PresentationPreDefinition';
import PresentationFailure from '../screens/presentation/PresentationFailure';
import PresentationPostDefinition, {
  PresentationPostDefinitionParams
} from '../screens/presentation/PresentationPostDefinition';
import PresentationSuccess from '../screens/presentation/PresentationSuccess';
import CredentialTrust from '../screens/credentialIssuance/CredentialTrust';
import {CredentialPreview} from '../screens/credentialIssuance/CredentialIssuancePreview';
import CredentialFailure from '../screens/credentialIssuance/CredentialFailure';
import CredentialsList from '../screens/credentialIssuance/CredentialsList';
import PresentationProximityPreview, {
  PresentationProximityPreviewProps
} from '../screens/proximity/PresentationProximityPreview';
import PresentationProximityFailure, {
  PresentationProximityFailureProps
} from '../screens/proximity/PresentationProximityFailure';
import PresentationProximitySuccess from '../screens/proximity/PresentationProximitySuccess';
import {WalletInstanceCreation} from '../screens/pidIssuance/WalletInstanceCreation';
import {IdentificationMethod} from '../screens/pidIssuance/IdentificationMethod';
import WALLET_ROUTES from './routes';

/**
 * Screen parameters for the wallet navigator.
 * New screens should be added here along with their parameters.
 */
export type WalletNavigatorParamsList = {
  // Pid issuance
  [WALLET_ROUTES.PID_ISSUANCE.INSTANCE_CREATION]: undefined;
  [WALLET_ROUTES.PID_ISSUANCE.ID_METHOD]: undefined;
  [WALLET_ROUTES.PID_ISSUANCE.REQUEST]: undefined;
  [WALLET_ROUTES.PID_ISSUANCE.SUCCESS]: undefined;
  [WALLET_ROUTES.PID_ISSUANCE.FAILURE]: undefined;

  // Credential presentation
  [WALLET_ROUTES.PRESENTATION
    .CREDENTIAL_DETAILS]: PresentationCredentialDetailNavigationParams;
  [WALLET_ROUTES.PRESENTATION.PRE_DEFINITION]: PresentationPreDefinitionParams;
  [WALLET_ROUTES.PRESENTATION.FAILURE]: undefined;
  [WALLET_ROUTES.PRESENTATION
    .POST_DEFINITION]: PresentationPostDefinitionParams;
  [WALLET_ROUTES.PRESENTATION.SUCCESS]: undefined;

  // Credential Issuance
  [WALLET_ROUTES.CREDENTIAL_ISSUANCE.LIST]: undefined;
  [WALLET_ROUTES.CREDENTIAL_ISSUANCE.TRUST]: undefined;
  [WALLET_ROUTES.CREDENTIAL_ISSUANCE.PREVIEW]: undefined;
  [WALLET_ROUTES.CREDENTIAL_ISSUANCE.FAILURE]: undefined;

  // Proximity
  [WALLET_ROUTES.PROXIMITY.PREVIEW]: PresentationProximityPreviewProps;
  [WALLET_ROUTES.PROXIMITY.SUCCESS]: undefined;
  [WALLET_ROUTES.PROXIMITY.FAILURE]: PresentationProximityFailureProps;
};

const Stack = createNativeStackNavigator<WalletNavigatorParamsList>();

/**
 * The wallted related stack which is used to navigate between wallet related screens.
 * It includes the pid issuance flow.
 */
const WalletNavigator = () => (
  <Stack.Navigator
    initialRouteName={WALLET_ROUTES.PID_ISSUANCE.INSTANCE_CREATION}
    screenOptions={{headerShown: false}}>
    <Stack.Group>
      <Stack.Screen
        name={WALLET_ROUTES.PID_ISSUANCE.INSTANCE_CREATION}
        component={WalletInstanceCreation}
      />
      <Stack.Screen
        name={WALLET_ROUTES.PID_ISSUANCE.ID_METHOD}
        component={IdentificationMethod}
      />
      <Stack.Screen
        name={WALLET_ROUTES.PID_ISSUANCE.FAILURE}
        component={PidIssuanceFailure}
      />
      <Stack.Screen
        name={WALLET_ROUTES.PID_ISSUANCE.REQUEST}
        component={PidIssuancRequest}
      />
      <Stack.Screen
        name={WALLET_ROUTES.PID_ISSUANCE.SUCCESS}
        component={PidIssuanceSuccess}
      />
      <Stack.Screen
        name={WALLET_ROUTES.PRESENTATION.CREDENTIAL_DETAILS}
        component={PresentationCredentialDetails}
      />
    </Stack.Group>
    <Stack.Group>
      <Stack.Screen
        name={WALLET_ROUTES.PRESENTATION.PRE_DEFINITION}
        component={PresentationPreDefinition}
      />
      <Stack.Screen
        name={WALLET_ROUTES.PRESENTATION.FAILURE}
        component={PresentationFailure}
      />
      <Stack.Screen
        name={WALLET_ROUTES.PRESENTATION.POST_DEFINITION}
        component={PresentationPostDefinition}
      />
      <Stack.Screen
        name={WALLET_ROUTES.PRESENTATION.SUCCESS}
        component={PresentationSuccess}
      />
    </Stack.Group>
    <Stack.Group>
      <Stack.Screen
        name={WALLET_ROUTES.CREDENTIAL_ISSUANCE.LIST}
        component={CredentialsList}
      />
      <Stack.Screen
        name={WALLET_ROUTES.CREDENTIAL_ISSUANCE.TRUST}
        component={CredentialTrust}
      />
      <Stack.Screen
        name={WALLET_ROUTES.CREDENTIAL_ISSUANCE.PREVIEW}
        component={CredentialPreview}
      />
      <Stack.Screen
        name={WALLET_ROUTES.CREDENTIAL_ISSUANCE.FAILURE}
        component={CredentialFailure}
      />
    </Stack.Group>
    <Stack.Group>
      <Stack.Screen
        name={WALLET_ROUTES.PROXIMITY.PREVIEW}
        component={PresentationProximityPreview}
      />
      <Stack.Screen
        name={WALLET_ROUTES.PROXIMITY.SUCCESS}
        component={PresentationProximitySuccess}
      />
      <Stack.Screen
        name={WALLET_ROUTES.PROXIMITY.FAILURE}
        component={PresentationProximityFailure}
      />
    </Stack.Group>
  </Stack.Navigator>
);

export default WalletNavigator;
