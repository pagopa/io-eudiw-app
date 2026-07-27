import { ListItemInfo } from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Alert, Platform } from 'react-native';
import {
  IOScrollViewWithListItems,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
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
  const { t } = useTranslation(['wallet']);
  const navigation = useNavigation();
  const { startEngagement } = useProximityEngagement();

  useHeaderSecondLevel({
    title: '',
    goBack: () => navigation.goBack()
  });

  const handleContinue = async () => {
    const isBleActive = await checkBluetoothActivation();
    if (isBleActive) {
      startEngagement('qrcode', { replaceScreen: true });
      return;
    }

    Alert.alert(
      t('wallet:proximity.bluetooth.activation.alert.title'),
      t('wallet:proximity.bluetooth.activation.alert.message'),
      [
        {
          text: t('wallet:proximity.bluetooth.activation.alert.text'),
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const listItems: Array<ListItemInfo> = [
    {
      label: t('wallet:proximity.bluetooth.activation.listItems.step1.label'),
      value: t('wallet:proximity.bluetooth.activation.listItems.step1.value'),
      icon:
        Platform.OS === 'ios' ? 'systemSettingsiOS' : 'systemSettingsAndroid'
    },
    {
      label: t('wallet:proximity.bluetooth.activation.listItems.step2.label'),
      value: t('wallet:proximity.bluetooth.activation.listItems.step2.value'),
      icon: 'systemAppsAndroid'
    },
    {
      label: t('wallet:proximity.bluetooth.activation.listItems.step3.label'),
      value: t('wallet:proximity.bluetooth.activation.listItems.step3.value'),
      icon: 'systemToggleInstructions'
    }
  ];

  return (
    <IOScrollViewWithListItems
      title={t('wallet:proximity.bluetooth.activation.title')}
      subtitle={t('wallet:proximity.bluetooth.activation.subtitle')}
      listItemHeaderLabel={t(
        'wallet:proximity.bluetooth.activation.listItems.title'
      )}
      renderItems={listItems}
      actions={{
        type: 'TwoButtons',
        primary: {
          label: t('wallet:proximity.bluetooth.activation.actions.primary'),
          onPress: openBluetoothPreferences
        },
        secondary: {
          label: t('wallet:proximity.bluetooth.activation.actions.secondary'),
          onPress: () => void handleContinue()
        }
      }}
    />
  );
};

export default ItwBluetoothActivationScreen;
