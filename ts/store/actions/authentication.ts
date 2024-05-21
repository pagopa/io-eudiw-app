import { ActionType, createStandardAction } from "typesafe-actions";

export const sessionExpired = createStandardAction("SESSION_EXPIRED")();

export const sessionInvalid = createStandardAction("SESSION_INVALID")();

export type AuthenticationActions =
  | ActionType<typeof sessionExpired>
  | ActionType<typeof sessionInvalid>;
