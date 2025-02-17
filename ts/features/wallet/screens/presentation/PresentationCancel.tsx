import {useTranslation} from 'react-i18next';
import React from 'react';
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from '../../../../components/screens/OperationResultScreenContent';
import {useAppDispatch, useAppSelector} from '../../../../store';
import {
  resetPresentation,
  selectPostDefinitionResult
} from '../../store/presentation';
import {useDebugInfo} from '../../../../hooks/useDebugInfo';
import {useNavigateToWalletWithReset} from '../../../../hooks/useNavigateToWalletWithReset';

/**
 * Screen to be shown when a user cancels a presentation flow.
 * It shows an information message and a button to navigate back to the wallet.
 */
const PresentationCancel = () => {
  const {t} = useTranslation(['wallet', 'global']);
  const dispatch = useAppDispatch();
  const {navigateToWallet} = useNavigateToWalletWithReset();
  const result = useAppSelector(selectPostDefinitionResult);

  useDebugInfo({result});

  const props : OperationResultScreenContentProps = {
    pictogram : 'trash',
    title : t('wallet:presentation.cancel.title'),
    subtitle : t('wallet:presentation.cancel.subtitle'),
    action : {
        accessibilityLabel : t('global:buttons.understand'),
        label : t('global:buttons.understand'),
        onPress: () => {
            navigateToWallet();
            dispatch(resetPresentation());
        }
    }
  };

  return <OperationResultScreenContent {...props} />;
};

export default PresentationCancel;
