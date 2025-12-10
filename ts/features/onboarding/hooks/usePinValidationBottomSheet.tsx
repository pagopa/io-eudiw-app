import {VSpacer} from '@pagopa/io-app-design-system';
import {memo} from 'react';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {useIOBottomSheetModal} from '../../../hooks/useBottomSheet';
import IOMarkdown from '../../../components/IOMarkdown';

/**
 * Bottom sheet which contains the PIN policy for the app.
 */
const BottomSheetContent = memo(() => {
  const {bottom} = useSafeAreaInsets();
  const {t} = useTranslation('onboarding');

  return (
    <View>
      <IOMarkdown content={t('pin.policy.description')} />
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
