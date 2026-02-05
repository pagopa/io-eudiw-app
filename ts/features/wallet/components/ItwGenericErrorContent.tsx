import { useNavigation } from '@react-navigation/native';
import I18n from 'i18next';
import { OperationResultScreenContent } from '../../../components/screens/OperationResultScreenContent';

/**
 * Error view component which currently displays a generic error.
 */
export const ItwGenericErrorContent = () => {
  const navigation = useNavigation();
  return (
    <OperationResultScreenContent
      pictogram="fatalError"
      title={I18n.t('generic.error.title', { ns: 'wallet' })}
      subtitle={I18n.t('generic.error.body', { ns: 'wallet' })}
      action={{
        accessibilityLabel: I18n.t('buttons.back', { ns: 'global' }),
        label: I18n.t('buttons.back', { ns: 'global' }),
        onPress: () => navigation.goBack()
      }}
    />
  );
};
