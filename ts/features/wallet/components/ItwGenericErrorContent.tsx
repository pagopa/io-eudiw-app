import { useNavigation } from '@react-navigation/native';
import { t } from 'i18next';
import { OperationResultScreenContent } from '../../../components/screens/OperationResultScreenContent';

/**
 * Error view component which currently displays a generic error.
 */
export const ItwGenericErrorContent = () => {
  const navigation = useNavigation();
  return (
    <OperationResultScreenContent
      pictogram="fatalError"
      title={t('generic.error.title', { ns: 'wallet' })}
      subtitle={t('generic.error.body', { ns: 'wallet' })}
      action={{
        accessibilityLabel: t('buttons.back', { ns: 'global' }),
        label: t('buttons.back', { ns: 'global' }),
        onPress: () => navigation.goBack()
      }}
    />
  );
};
