import {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';

/**
 * Hook to manage a log box for the proximity flow.
 * It allows to set and reset the log content.
 * It is used by [useProximityLogBottomSheet](useProximityLogBottomSheet.tsx) to display the logs in a bottom sheet and by [useProximity](useProximity.tsx) to log events.
 */
export const useLogBox = () => {
  const {t} = useTranslation(['wallet']);
  const initialLog = t('proximity.log');
  const [logBox, innerSetLogBox] = useState<string>(initialLog);

  const setLogBox = useCallback((content: string) => {
    innerSetLogBox(prev => `${prev} \n ============== \n ${content}`);
  }, []);

  const resetLogBox = useCallback(() => {
    innerSetLogBox(initialLog);
  }, [initialLog]);

  return {logBox, setLogBox, resetLogBox};
};
