import {useFocusEffect} from '@react-navigation/native';
import React from 'react';
import {
  resetDebugData,
  selectIsDebugModeEnabled,
  setDebugData
} from '../store/reducers/debug';
import {useAppDispatch, useAppSelector} from '../store';

/**
 * Sets debug data for the mounted component. Removes it when the component is unmounted
 * @param data Data to be displayes in debug mode
 */
export const useDebugInfo = (data: Record<string, unknown>) => {
  const dispatch = useAppDispatch();
  const isDebug = useAppSelector(selectIsDebugModeEnabled);

  useFocusEffect(
    React.useCallback(() => {
      // Avoids storing debug data if debug is disabled
      if (!isDebug) {
        return undefined;
      }

      dispatch(setDebugData(data));

      return () => {
        dispatch(resetDebugData(Object.keys(data)));
      };
    }, [dispatch, isDebug, data])
  );
};
