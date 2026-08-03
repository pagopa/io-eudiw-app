import {
  DebugInfoOverlay,
  selectIsDebugModeEnabled
} from '@io-eudiw-app/debug-info';
import { IOColors } from '@pagopa/io-app-design-system';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'react-native';

import { RootStackNavigator } from '../navigation/RootStacknavigator';
import { useAppSelector } from '../store';

/**
 * This is the root container of the app. It contains the main navigation stack and the debug overlay.
 * It must be rendered in the root of the app after the store provider.
 * @returns
 */
const RootContainer = () => {
  const isDebugModeEnabled = useAppSelector(selectIsDebugModeEnabled);
  const { t } = useTranslation(['common']);

  return (
    <>
      <StatusBar backgroundColor={IOColors.white} barStyle={'dark-content'} />
      {isDebugModeEnabled && (
        <DebugInfoOverlay
          clipboardSuccessMessage={t('common:clipboard.copyFeedback')}
        />
      )}
      <RootStackNavigator />
    </>
  );
};

export default RootContainer;
