import {useTranslation} from 'react-i18next';
import React from 'react';
import {useIOToast} from '@pagopa/io-app-design-system';
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
import {openWebUrl} from '../../../../utils/url';

/**
 * Screen to be shown when the presentation of the credential is successful.
 * It shows a success message and a button to navigate back to the wallet.
 */
const PresentationSuccess = () => {
  const {t} = useTranslation(['wallet', 'global']);
  const dispatch = useAppDispatch();
  const {navigateToWallet} = useNavigateToWalletWithReset();
  const result = useAppSelector(selectPostDefinitionResult);
  const toast = useIOToast();

  useDebugInfo({result});

  const getPropsByResult = (): OperationResultScreenContentProps => {
    const redirectUri = result?.redirect_uri;
    return redirectUri
      ? {
          pictogram: 'success',
          title: t('wallet:presentation.successWithRedirect.title'),
          subtitle: t('wallet:presentation.successWithRedirect.subtitle'),
          action: {
            accessibilityLabel: t('global:buttons.continue'),
            label: t('global:buttons.continue'),
            onPress: () => {
              openWebUrl(redirectUri, () =>
                toast.success(t('global:errors.generic.title'))
              );
              navigateToWallet();
              dispatch(resetPresentation());
            }
          }
        }
      : {
          pictogram: 'success',
          title: t('wallet:presentation.success.title'),
          subtitle: t('wallet:presentation.success.subtitle'),
          action: {
            accessibilityLabel: t('global:buttons.done'),
            label: t('global:buttons.done'),
            onPress: () => {
              navigateToWallet();
              dispatch(resetPresentation());
            }
          }
        };
  };

  const props = getPropsByResult();

  return <OperationResultScreenContent {...props} />;
};

export default PresentationSuccess;
