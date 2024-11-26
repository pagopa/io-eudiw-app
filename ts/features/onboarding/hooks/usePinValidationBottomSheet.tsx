import {VSpacer, Body} from '@pagopa/io-app-design-system';
import React, {memo} from 'react';
import {View} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {useIOBottomSheetModal} from '../../../hooks/useBottomSheet';
import {BulletList} from '../../../components/BulletList';

/**
 * Bottom sheet which contains the PIN policy for the app.
 */
const BottomSheetContent = memo(() => {
  const {bottom} = useSafeAreaInsets();
  const {t} = useTranslation('onboarding');

  return (
    <View>
      <Body>{t('pin.policy.description')}</Body>
      <VSpacer size={16} />
      <Markdown
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
