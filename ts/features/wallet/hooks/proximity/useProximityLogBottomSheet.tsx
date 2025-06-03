import React from 'react';
import {View, Text} from 'react-native';
import {VSpacer} from '@pagopa/io-app-design-system';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {useIOBottomSheetModal} from '../../../../hooks/useBottomSheet';

type Props = {
  log: string;
};

const BottomSheetContent = ({log}: Props) => {
  const {bottom} = useSafeAreaInsets();

  return (
    <View>
      <Text>{log}</Text>
      {bottom === 0 && <VSpacer size={16} />}
    </View>
  );
};

/**
 * Bottom sheet which contains the logs from the proximity flow.
 */
export default ({log}: Props) => {
  const {t} = useTranslation('wallet');
  return useIOBottomSheetModal({
    title: t('proximity.log'),
    component: <BottomSheetContent log={log} />
  });
};
