import {
  preferencesResetMiniAppSelection,
  preferencesSetSelectedMiniAppId,
  selectSelectedMiniAppId
} from '@io-eudiw-app/preferences';
import { AppListener, AppListenerWithAction } from './types';
import { startupSetStatus } from '../../store/reducers/startup';
import { isAnyOf } from '@reduxjs/toolkit';
import {
  miniAppListenerMiddleware,
  startAppListening,
  startMiniAppListening
} from '.';
import { takeLatestEffect } from '@io-eudiw-app/commons';
import { getMiniAppById } from '../../utils/miniapp';
import { handlePendingDeepLink } from './common';

export const mountSelectedMiniAppListeners = (listenerApi: AppListener) => {
  miniAppListenerMiddleware.clearListeners();
  const selectedId = selectSelectedMiniAppId(listenerApi.getState());
  const miniApp = getMiniAppById(selectedId);
  miniApp?.addListeners(startMiniAppListening);
};

const changeMiniAppSelection: AppListenerWithAction<
  ReturnType<typeof preferencesResetMiniAppSelection>
> = async (_, listenerApi) => {
  miniAppListenerMiddleware.clearListeners();
  listenerApi.dispatch(startupSetStatus('WAIT_MINI_APP_SELECTION'));
  await listenerApi.take(isAnyOf(preferencesSetSelectedMiniAppId));
  mountSelectedMiniAppListeners(listenerApi);
  listenerApi.dispatch(startupSetStatus('DONE'));
  await handlePendingDeepLink(listenerApi);
};

export const changeMiniAppSelectionListener = () =>
  startAppListening({
    matcher: isAnyOf(preferencesResetMiniAppSelection),
    effect: takeLatestEffect(changeMiniAppSelection)
  });
