import * as t from "io-ts";
import { PatternString } from "@pagopa/ts-commons/lib/strings";

/**
 * A string that matches a two digits month number (00-12)
 */
export const CreditCardExpirationMonth = PatternString("^(0[1-9]|1[0-2])$");
export type CreditCardExpirationMonth = t.TypeOf<
  typeof CreditCardExpirationMonth
>;

/**
 * A string that matches a two digits year number (00-99)
 */
// FIXME: check that expiration year is >= current year
// (possibly check month as well if year == current year)
export const CreditCardExpirationYear = PatternString("^[0-9]{2}$");
export type CreditCardExpirationYear = t.TypeOf<
  typeof CreditCardExpirationYear
>;
