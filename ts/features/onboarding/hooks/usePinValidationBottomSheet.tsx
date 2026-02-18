import { VSpacer, Body } from '@pagopa/io-app-design-system';
import { t } from 'i18next';
import { memo } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BulletList } from '@/ts/components/BulletList';
import { useIOBottomSheetModal } from '@/ts/hooks/useBottomSheet';

const BottomSheetContent = memo(() => {
  const { bottom } = useSafeAreaInsets();

  return (
    <View>
      <Body>{t('pin.policy.description', { ns: 'onboarding' })}</Body>
      <VSpacer size={16} />
      <BulletList
        title={t('pin.policy.bulletListTitle', { ns: 'onboarding' })}
        list={[
          {
            value: t('pin.policy.firstItem', { ns: 'onboarding' }),
            id: 'first_item'
          },
          {
            value: t('pin.policy.secondItem', { ns: 'onboarding' }),
            id: 'second_item'
          }
        ]}
        spacing={16}
      />
      {bottom === 0 && <VSpacer size={16} />}
    </View>
  );
});

export default () =>
  useIOBottomSheetModal({
    title: t('pin.policy.title', { ns: 'onboarding' }),
    component: <BottomSheetContent />
  });
