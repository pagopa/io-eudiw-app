import { constNull, pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { Linking } from "react-native";

export const isHttp = (url: string): boolean => {
  const urlLower = url.trim().toLocaleLowerCase();
  return urlLower.match(/http(s)?:\/\//gm) !== null;
};

export const taskLinking = (url: string) =>
  TE.tryCatch(
    () => Linking.openURL(url),
    _ => `cannot open url ${url}`
  );

const taskCanOpenUrl = (url: string) =>
  TE.tryCatch(
    () => (!isHttp(url) ? Promise.resolve(false) : Linking.canOpenURL(url)),
    _ => `cannot check if can open url ${url}`
  );

/**
 * open the web url if it can ben opened and if it has a valid protocol (http/https)
 * it should be used in place of direct call of Linking.openURL(url) with web urls
 */
export const openWebUrl = (url: string, onError: () => void = constNull) => {
  pipe(
    taskCanOpenUrl(url),
    TE.chainW(v => (v ? taskLinking(url) : TE.left("error")))
  )().then(E.fold(onError, constNull), onError);
};
