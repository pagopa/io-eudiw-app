import {Pressable, ScrollView, Text} from 'react-native';
import React from 'react';
import {useAppDispatch} from '../../../store';
import {onboardingSetIsComplete} from '../store/reducer';

const TestScreen = () => {
  const dispatch = useAppDispatch();

  const onPress = () => {
    dispatch(onboardingSetIsComplete());
  };

  return (
    <ScrollView>
      <Pressable onPress={onPress}>
        <Text>Finish Onboarding</Text>
      </Pressable>
    </ScrollView>
  );
};

export default TestScreen;
