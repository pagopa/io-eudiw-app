import {StatusBar} from 'react-native';
import {IOColors} from '@pagopa/io-app-design-system';
import {RootStackNavigator} from '../navigation/RootStacknavigator';
import {useAppSelector} from '../store';
import DebugInfoOverlay from '../components/debug/DebugInfoOverlay';
import {selectIsDebugModeEnabled} from '../store/reducers/debug';

/**
 * This is the root container of the app. It contains the main navigation stack and the debug overlay.
 * It must be rendered in the root of the app after the store provider.
 * @returns
 */
const RootContainer = () => {
  const isDebugModeEnabled = useAppSelector(selectIsDebugModeEnabled);

  return (
    <>
      <StatusBar barStyle={'dark-content'} backgroundColor={IOColors.white} />
      {isDebugModeEnabled && <DebugInfoOverlay />}
      <RootStackNavigator />
    </>
  );
};

export default RootContainer;
