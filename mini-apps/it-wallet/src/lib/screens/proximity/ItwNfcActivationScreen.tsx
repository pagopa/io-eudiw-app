import {
  IOScrollViewWithListItems,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
import { ListItemInfo } from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Alert, Platform } from 'react-native';

import { useProximityEngagement } from '../../hooks/useProximityEngagement';
import { checkNfcActivation, openNfcPreferences } from '../../utils/nfc';

/**
 * Screen shown when NFC is turned off, with instructions on how to enable it
 * from the system settings. "Continue" re-checks the NFC state and, when
 * enabled, switches the engagement to NFC. Going back returns to the QR
 * engagement, which is still in progress, without committing to NFC.
 */
const ItwNfcActivationScreen = () => {
  const { t } = useTranslation(['wallet']);
  const navigation = useNavigation();
  const { startEngagement } = useProximityEngagement();

  useHeaderSecondLevel({
    goBack: () => navigation.goBack(),
    title: ''
  });

  const handleContinue = async () => {
    const isNfcActive = await checkNfcActivation();
    if (isNfcActive) {
      startEngagement('nfc', { replaceScreen: true });
      return;
    }

    Alert.alert(
      t('wallet:proximity.nfc.activation.alert.title'),
      t('wallet:proximity.nfc.activation.alert.message'),
      [
        {
          onPress: () => {
            void openNfcPreferences();
          },
          text: t('wallet:proximity.nfc.activation.alert.action')
        },
        {
          onPress: () => navigation.goBack(),
          style: 'cancel',
          text: t('wallet:proximity.nfc.activation.alert.close')
        }
      ]
    );
  };

  const listItems: ListItemInfo[] = [
    {
      icon:
        Platform.OS === 'ios' ? 'systemSettingsiOS' : 'systemSettingsAndroid',
      label: t('wallet:proximity.nfc.activation.listItems.step1.label'),
      value: t('wallet:proximity.nfc.activation.listItems.step1.value')
    },
    {
      icon: 'systemAppsAndroid',
      label: t('wallet:proximity.nfc.activation.listItems.step2.label'),
      value: t('wallet:proximity.nfc.activation.listItems.step2.value')
    },
    {
      icon: 'systemToggleInstructions',
      label: t('wallet:proximity.nfc.activation.listItems.step3.label'),
      value: t('wallet:proximity.nfc.activation.listItems.step3.value')
    }
  ];

  return (
    <IOScrollViewWithListItems
      actions={{
        primary: {
          label: t('wallet:proximity.nfc.activation.actions.primary'),
          onPress: () => {
            void openNfcPreferences();
          }
        },
        secondary: {
          label: t('wallet:proximity.nfc.activation.actions.secondary'),
          onPress: () => void handleContinue()
        },
        type: 'TwoButtons'
      }}
      listItemHeaderLabel={t('wallet:proximity.nfc.activation.listItems.title')}
      renderItems={listItems}
      subtitle={t('wallet:proximity.nfc.activation.subtitle')}
      title={t('wallet:proximity.nfc.activation.title')}
    />
  );
};

export default ItwNfcActivationScreen;
