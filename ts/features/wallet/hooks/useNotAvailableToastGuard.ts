import { useIOToast } from '@pagopa/io-app-design-system';
import { useCallback } from 'react';
import { t } from 'i18next';

/**
 * A hook that wraps a function to show a "feature not available" toast
 * if the user has an ITW PID credential.
 * This is useful for features that are not yet available for ITW credentials such as
 * support request.
 * @param fn The function to be wrapped
 */
export const useNotAvailableToastGuard = () => {
  const toast = useIOToast();

  const guardFn = useCallback(() => {
    toast.info(t('generic.featureUnavailable.title', { ns: 'wallet' }));
  }, [toast]);

  return () => guardFn();
};
