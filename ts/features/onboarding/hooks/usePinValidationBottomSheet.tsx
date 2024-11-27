import {VSpacer} from '@pagopa/io-app-design-system';
import React, {memo} from 'react';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {useIOBottomSheetModal} from '../../../hooks/useBottomSheet';
import Markdown from '../../../components/markdown';

/**
 * Bottom sheet which contains the PIN policy for the app.
 */
const BottomSheetContent = memo(() => {
  const {bottom} = useSafeAreaInsets();
  const {t} = useTranslation('onboarding');

  return (
    <View>
      <Markdown content={t('pin.policy.description')} />
      {bottom === 0 && <VSpacer size={16} />}
    </View>
  );
});

export default () => {
  const {t} = useTranslation('onboarding');
  return useIOBottomSheetModal({
    title: t('pin.policy.title'),
    component: <BottomSheetContent />
  });
};
