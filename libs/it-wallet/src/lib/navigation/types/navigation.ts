/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-empty-interface */

import { MainNavigatorParamsList } from "../main/MainStackNavigator";

/**
 * Global type for the root navigator which is used as default type.
 * It's needed to correctly type useNavigation , Link, Ref, etc.
 * More info: https://reactnavigation.org/docs/typescript/#specifying-default-types-for-usenavigation-link-ref-etc
 */
declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends MainNavigatorParamsList {}
  }
}
