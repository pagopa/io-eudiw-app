import {Pressable, ScrollView, Text} from 'react-native';
import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useAppDispatch} from '../../../store';
import {onboardingSetIsComplete} from '../store/reducer';
import {OnboardingNavigatorParamsList} from '../navigation/OnboardingNavigator';

type Props = NativeStackScreenProps<OnboardingNavigatorParamsList, 'TEST'>;

const TestScreen = (_: Props) => {
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
