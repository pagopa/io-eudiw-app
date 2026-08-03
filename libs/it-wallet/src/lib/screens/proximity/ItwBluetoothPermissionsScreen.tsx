import {
  IOScrollViewWithListItems,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
import { ListItemInfo } from '@pagopa/io-app-design-system';
import { StackActions, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, Platform } from 'react-native';

import { useProximityEngagement } from '../../hooks/useProximityEngagement';
import MAIN_ROUTES from '../../navigation/main/routes';
import { checkBluetoothActivation } from '../../utils/bluetooth';
import { requestBlePermissions } from '../../utils/permissions';

/**
 * Screen shown when the Bluetooth permissions required by the proximity
 * presentation are denied, with instructions on how to grant them from the
 * system settings. "Continue" re-checks the permissions and, when granted,
 * moves on to the Bluetooth activation gate or starts the QR engagement.
 */
const ItwBluetoothPermissionsScreen = () => {
  const { t } = useTranslation(['wallet']);
  const navigation = useNavigation();
  const { startEngagement } = useProximityEngagement();

  useHeaderSecondLevel({
    goBack: () => navigation.goBack(),
    title: ''
  });

  const handleContinue = async () => {
    if (await requestBlePermissions()) {
      if (await checkBluetoothActivation()) {
        startEngagement('qrcode', { replaceScreen: true });
      } else {
        navigation.dispatch(
          StackActions.replace(MAIN_ROUTES.PROXIMITY_BLUETOOTH_ACTIVATION)
        );
      }
      return;
    }

    Alert.alert(
      t('wallet:proximity.bluetooth.permissions.alert.title'),
      t('wallet:proximity.bluetooth.permissions.alert.message'),
      [
        {
          onPress: () => navigation.goBack(),
          text: t('wallet:proximity.bluetooth.permissions.alert.text')
        }
      ]
    );
  };

  const listItems: ListItemInfo[] = [
    {
      icon:
        Platform.OS === 'ios' ? 'systemSettingsiOS' : 'systemSettingsAndroid',
      label: t('wallet:proximity.bluetooth.permissions.listItems.step1.label'),
      value: t('wallet:proximity.bluetooth.permissions.listItems.step1.value')
    },
    {
      icon: 'systemAppsAndroid',
      label: t('wallet:proximity.bluetooth.permissions.listItems.step2.label'),
      value: t('wallet:proximity.bluetooth.permissions.listItems.step2.value')
    },
    {
      icon: 'productITWallet',
      label: t('wallet:proximity.bluetooth.permissions.listItems.step3.label'),
      value: t('wallet:proximity.bluetooth.permissions.listItems.step3.value')
    },
    {
      icon: 'systemToggleInstructions',
      label: t('wallet:proximity.bluetooth.permissions.listItems.step4.label'),
      value: t('wallet:proximity.bluetooth.permissions.listItems.step4.value')
    }
  ];

  return (
    <IOScrollViewWithListItems
      actions={{
        primary: {
          label: t('wallet:proximity.bluetooth.permissions.actions.primary'),
          onPress: () => {
            void Linking.openSettings();
          }
        },
        secondary: {
          label: t('wallet:proximity.bluetooth.permissions.actions.secondary'),
          onPress: () => void handleContinue()
        },
        type: 'TwoButtons'
      }}
      listItemHeaderLabel={t(
        'wallet:proximity.bluetooth.permissions.listItems.title'
      )}
      renderItems={listItems}
      subtitle={t('wallet:proximity.bluetooth.permissions.subtitle')}
      title={t('wallet:proximity.bluetooth.permissions.title')}
    />
  );
};

export default ItwBluetoothPermissionsScreen;
