import { createStackNavigator } from '@react-navigation/stack';

import CredentialAlreadyObtained from '../../screens/credentialIssuance/CredentialAlreadyObtained';
import CredentialFailure from '../../screens/credentialIssuance/CredentialFailure';
import { CredentialPreview } from '../../screens/credentialIssuance/CredentialIssuancePreview';
import CredentialsList from '../../screens/credentialIssuance/CredentialsList';
import CredentialTrust from '../../screens/credentialIssuance/CredentialTrust';
import ResolvedCredentialOffer, {
  CredentialOfferParams
} from '../../screens/deeplink/CredentialOffer';
import DeepLinkError, {
  DeepLinkErrorParams
} from '../../screens/deeplink/DeepLinkError';
import DeepLinkHandler, {
  DeepLinkHandlerParams
} from '../../screens/deeplink/DeepLinkHandler';
import { IdentificationMethod } from '../../screens/pidIssuance/IdentificationMethod';
import PidIssuanceFailure from '../../screens/pidIssuance/PidIssuanceFailure';
import PidIssuancRequest from '../../screens/pidIssuance/PidIssuanceRequest';
import { WalletInstanceCreation } from '../../screens/pidIssuance/WalletInstanceCreation';
import {
  ItwPresentationCredentialCardModal,
  ItwPresentationCredentialCardModalNavigationParams
} from '../../screens/presentation/ItwPresentationCredentialCardModal';
import {
  ItwPresentationCredentialCardScreen,
  ItwPresentationCredentialCardScreenNavigationParams
} from '../../screens/presentation/ItwPresentationCredentialCardScreen';
import {
  ItwPresentationCredentialDetailNavigationParams,
  ItwPresentationCredentialDetailScreen
} from '../../screens/presentation/ItwPresentationCredentialDetailScreen';
import { ItwPresentationPidDetailScreen } from '../../screens/presentation/ItwPresentationPidDetailScreen';
import PresentationCredentialNotFound, {
  PresentationCredentialNotFoundParams
} from '../../screens/presentation/PresentationCredentialNotFound';
import PresentationFailure from '../../screens/presentation/PresentationFailure';
import PresentationPostDefinition, {
  PresentationPostDefinitionParams
} from '../../screens/presentation/PresentationPostDefinition';
import PresentationPreDefinition, {
  PresentationPreDefinitionParams
} from '../../screens/presentation/PresentationPreDefinition';
import PresentationSuccess from '../../screens/presentation/PresentationSuccess';
import PresentationWalletNotActive, {
  PresentationWalletNotActiveParams
} from '../../screens/presentation/PresentationWalletNotActive';
import ItwProximityStoreConsent from '../../screens/proximity/ItwProximityStoreConsent';
import PresentationProximityFailure, {
  PresentationProximityFailureProps
} from '../../screens/proximity/PresentationProximityFailure';
import PresentationProximityPreview from '../../screens/proximity/PresentationProximityPreview';
import PresentationProximitySuccess from '../../screens/proximity/PresentationProximitySuccess';
import WALLET_ROUTES from './routes';

/**
 * Screen parameters for the wallet navigator.
 * New screens should be added here along with their parameters.
 */
export type WalletNavigatorParamsList = {
  [WALLET_ROUTES.CREDENTIAL_ISSUANCE.ALREADY_OBTAINED]: undefined;
  [WALLET_ROUTES.CREDENTIAL_ISSUANCE.FAILURE]: undefined;
  // Credential Issuance
  [WALLET_ROUTES.CREDENTIAL_ISSUANCE.LIST]: undefined;

  [WALLET_ROUTES.CREDENTIAL_ISSUANCE.PREVIEW]: undefined;
  [WALLET_ROUTES.CREDENTIAL_ISSUANCE.TRUST]: undefined;
  [WALLET_ROUTES.CREDENTIAL_OFFER.ISSUANCE]: CredentialOfferParams;
  [WALLET_ROUTES.DEEP_LINK.ERROR]: DeepLinkErrorParams;

  // Deep link / QR centralized entry point
  [WALLET_ROUTES.DEEP_LINK.HANDLER]: DeepLinkHandlerParams;
  [WALLET_ROUTES.PID_ISSUANCE.FAILURE]: undefined;
  [WALLET_ROUTES.PID_ISSUANCE.ID_METHOD]: undefined;
  // Pid issuance
  [WALLET_ROUTES.PID_ISSUANCE.INSTANCE_CREATION]: undefined;
  [WALLET_ROUTES.PID_ISSUANCE.REQUEST]: undefined;
  [WALLET_ROUTES.PRESENTATION
    .CREDENTIAL_CARD_MODAL]: ItwPresentationCredentialCardModalNavigationParams;
  [WALLET_ROUTES.PRESENTATION
    .CREDENTIAL_CARD_SCREEN]: ItwPresentationCredentialCardScreenNavigationParams;
  [WALLET_ROUTES.PRESENTATION
    .CREDENTIAL_DETAILS]: ItwPresentationCredentialDetailNavigationParams;
  [WALLET_ROUTES.PRESENTATION
    .CREDENTIAL_NOT_FOUND]: PresentationCredentialNotFoundParams;
  [WALLET_ROUTES.PRESENTATION.FAILURE]: undefined;

  // Credential presentation
  [WALLET_ROUTES.PRESENTATION.PID_DETAIL]: undefined;
  [WALLET_ROUTES.PRESENTATION
    .POST_DEFINITION]: PresentationPostDefinitionParams;
  [WALLET_ROUTES.PRESENTATION.PRE_DEFINITION]: PresentationPreDefinitionParams;
  [WALLET_ROUTES.PRESENTATION.SUCCESS]: undefined;
  [WALLET_ROUTES.PRESENTATION
    .WALLET_NOT_ACTIVE]: PresentationWalletNotActiveParams;

  [WALLET_ROUTES.PROXIMITY.FAILURE]: PresentationProximityFailureProps;
  // Proximity
  [WALLET_ROUTES.PROXIMITY.PREVIEW]: undefined;
  [WALLET_ROUTES.PROXIMITY.STORE_CONSENT]: undefined;
  [WALLET_ROUTES.PROXIMITY.SUCCESS]: undefined;
};

const Stack = createStackNavigator<WalletNavigatorParamsList>();

/**
 * The wallted related stack which is used to navigate between wallet related screens.
 * It includes the pid issuance flow.
 */
const WalletNavigator = () => (
  <Stack.Navigator
    initialRouteName={WALLET_ROUTES.PID_ISSUANCE.INSTANCE_CREATION}
  >
    <Stack.Group>
      <Stack.Screen
        component={DeepLinkHandler}
        name={WALLET_ROUTES.DEEP_LINK.HANDLER}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={DeepLinkError}
        name={WALLET_ROUTES.DEEP_LINK.ERROR}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={ResolvedCredentialOffer}
        name={WALLET_ROUTES.CREDENTIAL_OFFER.ISSUANCE}
        options={{ headerShown: false }}
      />
    </Stack.Group>
    <Stack.Group>
      <Stack.Screen
        component={WalletInstanceCreation}
        name={WALLET_ROUTES.PID_ISSUANCE.INSTANCE_CREATION}
      />
      <Stack.Screen
        component={IdentificationMethod}
        name={WALLET_ROUTES.PID_ISSUANCE.ID_METHOD}
      />
      <Stack.Screen
        component={PidIssuanceFailure}
        name={WALLET_ROUTES.PID_ISSUANCE.FAILURE}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={PidIssuancRequest}
        name={WALLET_ROUTES.PID_ISSUANCE.REQUEST}
      />
      <Stack.Screen
        component={ItwPresentationPidDetailScreen}
        name={WALLET_ROUTES.PRESENTATION.PID_DETAIL}
      />
      <Stack.Screen
        component={ItwPresentationCredentialDetailScreen}
        name={WALLET_ROUTES.PRESENTATION.CREDENTIAL_DETAILS}
      />
      <Stack.Screen
        component={ItwPresentationCredentialCardModal}
        name={WALLET_ROUTES.PRESENTATION.CREDENTIAL_CARD_MODAL}
      />
      <Stack.Screen
        component={ItwPresentationCredentialCardScreen}
        name={WALLET_ROUTES.PRESENTATION.CREDENTIAL_CARD_SCREEN}
      />
    </Stack.Group>
    <Stack.Group>
      <Stack.Screen
        component={PresentationPreDefinition}
        name={WALLET_ROUTES.PRESENTATION.PRE_DEFINITION}
      />
      <Stack.Screen
        component={PresentationFailure}
        name={WALLET_ROUTES.PRESENTATION.FAILURE}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={PresentationCredentialNotFound}
        name={WALLET_ROUTES.PRESENTATION.CREDENTIAL_NOT_FOUND}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={PresentationWalletNotActive}
        name={WALLET_ROUTES.PRESENTATION.WALLET_NOT_ACTIVE}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={PresentationPostDefinition}
        name={WALLET_ROUTES.PRESENTATION.POST_DEFINITION}
      />
      <Stack.Screen
        component={PresentationSuccess}
        name={WALLET_ROUTES.PRESENTATION.SUCCESS}
        options={{ headerShown: false }}
      />
    </Stack.Group>
    <Stack.Group>
      <Stack.Screen
        component={CredentialsList}
        name={WALLET_ROUTES.CREDENTIAL_ISSUANCE.LIST}
      />
      <Stack.Screen
        component={CredentialTrust}
        name={WALLET_ROUTES.CREDENTIAL_ISSUANCE.TRUST}
      />
      <Stack.Screen
        component={CredentialPreview}
        name={WALLET_ROUTES.CREDENTIAL_ISSUANCE.PREVIEW}
      />
      <Stack.Screen
        component={CredentialFailure}
        name={WALLET_ROUTES.CREDENTIAL_ISSUANCE.FAILURE}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={CredentialAlreadyObtained}
        name={WALLET_ROUTES.CREDENTIAL_ISSUANCE.ALREADY_OBTAINED}
        options={{ headerShown: false }}
      />
    </Stack.Group>
    <Stack.Group>
      <Stack.Screen
        component={PresentationProximityPreview}
        name={WALLET_ROUTES.PROXIMITY.PREVIEW}
      />
      <Stack.Screen
        component={ItwProximityStoreConsent}
        name={WALLET_ROUTES.PROXIMITY.STORE_CONSENT}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={PresentationProximitySuccess}
        name={WALLET_ROUTES.PROXIMITY.SUCCESS}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={PresentationProximityFailure}
        name={WALLET_ROUTES.PROXIMITY.FAILURE}
        options={{ headerShown: false }}
      />
    </Stack.Group>
  </Stack.Navigator>
);

export default WalletNavigator;
