import { Linking } from 'react-native';
import { selectUrl } from '../../store/reducers/deeplinking';
import { AppListener } from './types';

/**
 * Handles the pending deep link by opening the URL if it exists in the deep linking store.
 */
export const handlePendingDeepLink = async (listenerApi: AppListener) => {
  const url = selectUrl(listenerApi.getState());
  if (url) {
    await Linking.openURL(url);
  }
};
