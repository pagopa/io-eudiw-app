import { ListItemInfo } from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Alert, Platform } from 'react-native';
import {
  IOScrollViewWithListItems,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
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
    title: '',
    goBack: () => navigation.goBack()
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
          text: t('wallet:proximity.nfc.activation.alert.action'),
          onPress: () => {
            void openNfcPreferences();
          }
        },
        {
          text: t('wallet:proximity.nfc.activation.alert.close'),
          onPress: () => navigation.goBack(),
          style: 'cancel'
        }
      ]
    );
  };

  const listItems: Array<ListItemInfo> = [
    {
      label: t('wallet:proximity.nfc.activation.listItems.step1.label'),
      value: t('wallet:proximity.nfc.activation.listItems.step1.value'),
      icon:
        Platform.OS === 'ios' ? 'systemSettingsiOS' : 'systemSettingsAndroid'
    },
    {
      label: t('wallet:proximity.nfc.activation.listItems.step2.label'),
      value: t('wallet:proximity.nfc.activation.listItems.step2.value'),
      icon: 'systemAppsAndroid'
    },
    {
      label: t('wallet:proximity.nfc.activation.listItems.step3.label'),
      value: t('wallet:proximity.nfc.activation.listItems.step3.value'),
      icon: 'systemToggleInstructions'
    }
  ];

  return (
    <IOScrollViewWithListItems
      title={t('wallet:proximity.nfc.activation.title')}
      subtitle={t('wallet:proximity.nfc.activation.subtitle')}
      listItemHeaderLabel={t('wallet:proximity.nfc.activation.listItems.title')}
      renderItems={listItems}
      actions={{
        type: 'TwoButtons',
        primary: {
          label: t('wallet:proximity.nfc.activation.actions.primary'),
          onPress: () => {
            void openNfcPreferences();
          }
        },
        secondary: {
          label: t('wallet:proximity.nfc.activation.actions.secondary'),
          onPress: () => void handleContinue()
        }
      }}
    />
  );
};

export default ItwNfcActivationScreen;
