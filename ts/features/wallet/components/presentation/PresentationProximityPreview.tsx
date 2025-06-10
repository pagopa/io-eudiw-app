import {ButtonSolid} from '@pagopa/io-app-design-system';
import React from 'react';
import {View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAppDispatch} from '../../../../store';
import {
  setProximityStatusAuthorizationComplete,
  setProximityStatusAuthorizationRejected
} from '../../store/proximity';

const PresentationProximityPreview = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  return (
    <View>
      <ButtonSolid
        label="yes"
        onPress={() => {
          dispatch(setProximityStatusAuthorizationComplete());
          navigation.navigate('MAIN_WALLET_NAV', {
            screen: 'PRESENTATION_SUCCESS'
          });
        }}
      />
      <ButtonSolid
        label="no"
        onPress={() => {
          dispatch(setProximityStatusAuthorizationRejected());
          navigation.navigate('MAIN_WALLET_NAV', {
            screen: 'PRESENTATION_FAILURE'
          });
        }}
      />
    </View>
  );
};

export default PresentationProximityPreview;
