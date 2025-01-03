import React from 'react';
import {RootStackNavigator} from '../navigation/RootStacknavigator';
import {useAppSelector} from '../store';
import DebugInfoOverlay from '../components/debug/DebugInfoOverlay';
import {selectIsDebugModeEnabled} from '../store/reducers/debug';

const RootContainer = () => {
  const isDebugModeEnabled = useAppSelector(selectIsDebugModeEnabled);
  return (
    <>
      {isDebugModeEnabled && <DebugInfoOverlay />}
      <RootStackNavigator />
    </>
  );
};

export default RootContainer;
