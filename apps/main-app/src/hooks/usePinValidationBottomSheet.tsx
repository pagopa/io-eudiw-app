import { useIOBottomSheetModal } from '@io-eudiw-app/commons';
import { Body, VSpacer } from '@pagopa/io-app-design-system';
import { t } from 'i18next';
import { memo } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BulletList } from '../components/BulletList';

const BottomSheetContent = memo(() => {
  const { bottom } = useSafeAreaInsets();

  return (
    <View>
      <Body>{t('onboarding.pin.policy.description', { ns: 'global' })}</Body>
      <VSpacer size={16} />
      <BulletList
        list={[
          {
            id: 'first_item',
            value: t('onboarding.pin.policy.firstItem', { ns: 'global' })
          },
          {
            id: 'second_item',
            value: t('onboarding.pin.policy.secondItem', { ns: 'global' })
          }
        ]}
        spacing={16}
        title={t('onboarding.pin.policy.bulletListTitle', { ns: 'global' })}
      />
      {bottom === 0 && <VSpacer size={16} />}
    </View>
  );
});

export default () =>
  useIOBottomSheetModal({
    closeAccessibilityLabel: t('buttons.close', { ns: 'common' }),
    component: <BottomSheetContent />,
    title: t('onboarding.pin.policy.title', { ns: 'global' })
  });
