import { useIOToast } from '@pagopa/io-app-design-system';
import { useTranslation } from 'react-i18next';
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from '../../../../components/screens/OperationResultScreenContent';
import { useDebugInfo } from '../../../../hooks/useDebugInfo';
import { useNavigateToWalletWithReset } from '../../../../hooks/useNavigateToWalletWithReset';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { openWebUrl } from '../../../../utils/url';
import {
  resetPresentation,
  selectPostDefinitionResult
} from '../../store/presentation';

/**
 * Screen to be shown when the presentation of the credential is successful.
 * It shows a success message and a button to navigate back to the wallet.
 */
const PresentationSuccess = () => {
  const { t } = useTranslation(['wallet', 'global']);
  const dispatch = useAppDispatch();
  const { navigateToWallet } = useNavigateToWalletWithReset();
  const result = useAppSelector(selectPostDefinitionResult);
  const toast = useIOToast();

  useDebugInfo({ result });

  const getPropsByResult = (): OperationResultScreenContentProps => {
    const redirectUri = result?.redirect_uri;
    return redirectUri
      ? {
          pictogram: 'success',
          title: t('wallet:presentation.successWithRedirect.title'),
          subtitle: t('wallet:presentation.successWithRedirect.subtitle'),
          action: {
            accessibilityLabel: t(
              'wallet:presentation.successWithRedirect.continue'
            ),
            label: t('wallet:presentation.successWithRedirect.continue'),
            onPress: () => {
              openWebUrl(redirectUri, () =>
                toast.error(t('global:errors.generic'))
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
            accessibilityLabel: t('global:buttons.close'),
            label: t('global:buttons.close'),
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
