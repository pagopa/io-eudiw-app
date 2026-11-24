import {
  IOScrollViewWithListItems,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
import { ListItemInfo } from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Alert, Platform } from 'react-native';

import { useProximityEngagement } from '../../hooks/useProximityEngagement';
import {
  checkBluetoothActivation,
  openBluetoothPreferences
} from '../../utils/bluetooth';

/**
 * Screen shown when Bluetooth is turned off, with instructions on how to
 * enable it from the system settings. "Continue" re-checks the Bluetooth state
 * and, when enabled, starts the QR engagement.
 */
const ItwBluetoothActivationScreen = () => {
  const { t } = useTranslation(['hsm']);
  const navigation = useNavigation();
  const { startEngagement } = useProximityEngagement();

  useHeaderSecondLevel({
    goBack: () => navigation.goBack(),
    title: ''
  });

  const handleContinue = async () => {
    const isBleActive = await checkBluetoothActivation();
    if (isBleActive) {
      startEngagement('qrcode', { replaceScreen: true });
      return;
    }

    Alert.alert(
      t('hsm:proximity.bluetooth.activation.alert.title'),
      t('hsm:proximity.bluetooth.activation.alert.message'),
      [
        {
          onPress: () => navigation.goBack(),
          text: t('hsm:proximity.bluetooth.activation.alert.text')
        }
      ]
    );
  };

  const listItems: ListItemInfo[] = [
    {
      icon:
        Platform.OS === 'ios' ? 'systemSettingsiOS' : 'systemSettingsAndroid',
      label: t('hsm:proximity.bluetooth.activation.listItems.step1.label'),
      value: t('hsm:proximity.bluetooth.activation.listItems.step1.value')
    },
    {
      icon: 'systemAppsAndroid',
      label: t('hsm:proximity.bluetooth.activation.listItems.step2.label'),
      value: t('hsm:proximity.bluetooth.activation.listItems.step2.value')
    },
    {
      icon: 'systemToggleInstructions',
      label: t('hsm:proximity.bluetooth.activation.listItems.step3.label'),
      value: t('hsm:proximity.bluetooth.activation.listItems.step3.value')
    }
  ];

  return (
    <IOScrollViewWithListItems
      actions={{
        primary: {
          label: t('hsm:proximity.bluetooth.activation.actions.primary'),
          onPress: openBluetoothPreferences
        },
        secondary: {
          label: t('hsm:proximity.bluetooth.activation.actions.secondary'),
          onPress: () => void handleContinue()
        },
        type: 'TwoButtons'
      }}
      listItemHeaderLabel={t(
        'hsm:proximity.bluetooth.activation.listItems.title'
      )}
      renderItems={listItems}
      subtitle={t('hsm:proximity.bluetooth.activation.subtitle')}
      title={t('hsm:proximity.bluetooth.activation.title')}
    />
  );
};

export default ItwBluetoothActivationScreen;
