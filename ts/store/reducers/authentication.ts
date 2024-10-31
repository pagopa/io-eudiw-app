import * as O from "fp-ts/lib/Option";
import { PersistPartial } from "redux-persist";
import { PublicSession } from "../../../definitions/backend/PublicSession";
import { SessionToken } from "../../types/SessionToken";
import { Action } from "../actions/types";
import { SpidIdp } from "../../../definitions/content/SpidIdp";
import { GlobalState } from "./types";

// Types

// reason for the user to be in the unauthenticated state
type LoggedOutReason = "NOT_LOGGED_IN" | "SESSION_EXPIRED";

// PublicSession attributes
export type TokenName = keyof Omit<
  PublicSession,
  "spidLevel" | "lollipopAssertionRef"
>;

// The user is logged out and hasn't selected an IDP
type LoggedOutWithoutIdp = Readonly<{
  kind: "LoggedOutWithoutIdp";
  reason: LoggedOutReason;
}>;

// The user is logged out but has already selected an IDP
export type LoggedOutWithIdp = Readonly<{
  kind: "LoggedOutWithIdp";
  idp: SpidIdp;
  reason: LoggedOutReason;
}>;

// The user is logged in but we still have to request the addition session info to the Backend
export type LoggedInWithoutSessionInfo = Readonly<{
  kind: "LoggedInWithoutSessionInfo";
  idp: SpidIdp;
  sessionToken: SessionToken;
}>;

// The user is logged in and we also have all session info
export type LoggedInWithSessionInfo = Readonly<{
  kind: "LoggedInWithSessionInfo";
  idp: SpidIdp;
  sessionToken: SessionToken;
  sessionInfo: PublicSession;
}>;

export type LogoutRequested = Readonly<{
  kind: "LogoutRequested";
  idp: SpidIdp;
  reason: LoggedOutReason;
}>;

export type AuthenticationState =
  | LoggedOutWithoutIdp
  | LoggedOutWithIdp
  | LogoutRequested
  | LoggedInWithoutSessionInfo
  | LoggedInWithSessionInfo;

type AuthenticationStateWithIdp =
  | LoggedOutWithIdp
  | LogoutRequested
  | LoggedInWithoutSessionInfo
  | LoggedInWithSessionInfo;

// Here we mix the plain AuthenticationState with the keys added by redux-persist
export type PersistedAuthenticationState = AuthenticationState & PersistPartial;

// Initially the user is logged out and hasn't selected an IDP
export const INITIAL_STATE: LoggedOutWithoutIdp = {
  kind: "LoggedOutWithoutIdp",
  reason: "NOT_LOGGED_IN"
};

function matchWithIdp<I>(
  state: AuthenticationState,
  whenWithoutIdp: I,
  whenWithIdp: (state: AuthenticationStateWithIdp) => I
): I {
  if (state.kind === "LoggedOutWithoutIdp") {
    return whenWithoutIdp;
  }

  return whenWithIdp(state);
}

export const idpSelector = ({
  authentication
}: GlobalState): O.Option<SpidIdp> =>
  matchWithIdp(authentication, O.none, ({ idp }) => O.some(idp));

const reducer = (
  state: AuthenticationState = INITIAL_STATE,
  action: Action
): AuthenticationState => {
  return state;
};

export default reducer;
