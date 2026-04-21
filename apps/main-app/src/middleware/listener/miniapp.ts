import {
  preferencesResetMiniAppSelection,
  preferencesSetSelectedMiniAppId
} from '@io-eudiw-app/preferences';
import { AppListenerWithAction } from './types';
import { startupSetStatus } from '../../store/reducers/startup';
import { isAnyOf } from '@reduxjs/toolkit';
import { startAppListening } from '.';
import { takeLatestEffect } from '@io-eudiw-app/commons';

const changeMiniAppSelection: AppListenerWithAction<
  ReturnType<typeof preferencesResetMiniAppSelection>
> = async (_, listenerApi) => {
  listenerApi.dispatch(startupSetStatus('WAIT_MINI_APP_SELECTION'));
  await listenerApi.take(isAnyOf(preferencesSetSelectedMiniAppId));
  listenerApi.dispatch(startupSetStatus('DONE'));
};

export const changeMiniAppSelectionListener = () =>
  startAppListening({
    matcher: isAnyOf(preferencesResetMiniAppSelection),
    effect: takeLatestEffect(changeMiniAppSelection)
  });
