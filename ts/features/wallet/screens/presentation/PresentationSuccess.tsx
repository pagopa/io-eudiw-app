import {useTranslation} from 'react-i18next';
import React from 'react';
import {OperationResultScreenContent} from '../../../../components/screens/OperationResultScreenContent';
import {useAppDispatch, useAppSelector} from '../../../../store';
import {
  resetPresentation,
  selectPostDefinitionResult
} from '../../store/presentation';
import {useDebugInfo} from '../../../../hooks/useDebugInfo';
import {useNavigateToWalletWithReset} from '../../../../hooks/useNavigateToWalletWithReset';

/**
 * Screen to be shown when the presentation of the credential is successful.
 * It shows a success message and a button to navigate back to the wallet.
 */
const PresentationSuccess = () => {
  const {t} = useTranslation(['wallet', 'global']);
  const dispatch = useAppDispatch();
  const result = useAppSelector(selectPostDefinitionResult);
  const {navigateToWallet} = useNavigateToWalletWithReset();

  useDebugInfo({result});

  return (
    <OperationResultScreenContent
      pictogram="success"
      title={t('wallet:presentation.success.title')}
      subtitle={t('wallet:presentation.success.subtitle')}
      action={{
        accessibilityLabel: t('global:buttons.done'),
        label: t('global:buttons.done'),
        onPress: () => {
          dispatch(resetPresentation());
          navigateToWallet();
        }
      }}
    />
  );
};

export default PresentationSuccess;
