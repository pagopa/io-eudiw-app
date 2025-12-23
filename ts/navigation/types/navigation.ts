import { RootStackParamList } from '../RootStacknavigator';

/**
 * Global type for the root navigator which is used as default type.
 * It's needed to correctly type useNavigation , Link, Ref, etc.
 * More info: https://reactnavigation.org/docs/typescript/#specifying-default-types-for-usenavigation-link-ref-etc
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
