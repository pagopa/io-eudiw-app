import { createStackNavigator } from '@react-navigation/stack';

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
import PRESENTATION_ROUTES from './routes';

export type PresentationNavigatorParamsList = {
  [PRESENTATION_ROUTES.CREDENTIAL_NOT_FOUND]: PresentationCredentialNotFoundParams;
  [PRESENTATION_ROUTES.FAILURE]: undefined;
  [PRESENTATION_ROUTES.POST_DEFINITION]: PresentationPostDefinitionParams;
  [PRESENTATION_ROUTES.PRE_DEFINITION]: PresentationPreDefinitionParams;
  [PRESENTATION_ROUTES.SUCCESS]: undefined;
};

const Stack = createStackNavigator<PresentationNavigatorParamsList>();

/**
 * Stack of the remote presentation flow.
 */
const PresentationNavigator = () => (
  <Stack.Navigator initialRouteName={PRESENTATION_ROUTES.PRE_DEFINITION}>
    <Stack.Screen
      component={PresentationPreDefinition}
      name={PRESENTATION_ROUTES.PRE_DEFINITION}
    />
    <Stack.Screen
      component={PresentationPostDefinition}
      name={PRESENTATION_ROUTES.POST_DEFINITION}
    />
    <Stack.Screen
      component={PresentationSuccess}
      name={PRESENTATION_ROUTES.SUCCESS}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      component={PresentationFailure}
      name={PRESENTATION_ROUTES.FAILURE}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      component={PresentationCredentialNotFound}
      name={PRESENTATION_ROUTES.CREDENTIAL_NOT_FOUND}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

export default PresentationNavigator;
