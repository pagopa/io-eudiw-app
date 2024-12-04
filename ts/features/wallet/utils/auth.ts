import URLParse from 'url-parse';

export const getIntentFallbackUrl = (intentUrl: string): string | undefined => {
  const intentProtocol = URLParse.extractProtocol(intentUrl);
  if (intentProtocol.protocol !== 'intent:' || !intentProtocol.slashes) {
    return undefined;
  }
  const hook = 'S.browser_fallback_url=';
  const hookIndex = intentUrl.indexOf(hook);
  const endIndex = intentUrl.indexOf(';end', hookIndex + hook.length);
  if (hookIndex !== -1 && endIndex !== -1) {
    return intentUrl.substring(hookIndex + hook.length, endIndex);
  }
  return undefined;
};
