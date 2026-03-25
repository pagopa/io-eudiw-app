import { VSpacer, Body } from '@pagopa/io-app-design-system';
import { t } from 'i18next';
import { memo } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BulletList } from '../../../components/BulletList';
import { useIOBottomSheetModal } from '@io-eudiw-app/commons';

const BottomSheetContent = memo(() => {
  const { bottom } = useSafeAreaInsets();

  return (
    <View>
      <Body>{t('onboarding.pin.policy.description', { ns: 'global' })}</Body>
      <VSpacer size={16} />
      <BulletList
        title={t('onboarding.pin.policy.bulletListTitle', { ns: 'global' })}
        list={[
          {
            value: t('onboarding.pin.policy.firstItem', { ns: 'global' }),
            id: 'first_item'
          },
          {
            value: t('onboarding.pin.policy.secondItem', { ns: 'global' }),
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
    title: t('onboarding.pin.policy.title', { ns: 'global' }),
    closeAccessibilityLabel: t('buttons.close', { ns: 'common' }),
    component: <BottomSheetContent />
  });
