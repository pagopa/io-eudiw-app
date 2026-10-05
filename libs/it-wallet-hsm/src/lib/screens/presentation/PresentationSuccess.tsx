import {
  openWebUrl,
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from '@io-eudiw-app/commons';
import { useDebugInfo } from '@io-eudiw-app/debug-info';
import { useIOToast } from '@pagopa/io-app-design-system';
import { useTranslation } from 'react-i18next';

import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  resetPresentation,
  selectPostDefinitionResult
} from '../../store/presentation';

/**
 * Screen to be shown when the presentation of the credential is successful.
 * It shows a success message and a button to navigate back to the wallet.
 */
const PresentationSuccess = () => {
  const { t } = useTranslation(['itWalletHsm', 'common']);
  const dispatch = useAppDispatch();
  const { navigateToWallet } = useNavigateToWalletWithReset();
  const result = useAppSelector(selectPostDefinitionResult);
  const toast = useIOToast();

  useDebugInfo({ result });

  const getPropsByResult = (): OperationResultScreenContentProps => {
    const redirectUri = result?.redirect_uri;
    return redirectUri
      ? {
          action: {
            accessibilityLabel: t(
              'itWalletHsm:presentation.successWithRedirect.continue'
            ),
            label: t('itWalletHsm:presentation.successWithRedirect.continue'),
            onPress: () => {
              openWebUrl(redirectUri, () =>
                toast.error(t('common:errors.generic'))
              );
              navigateToWallet();
              dispatch(resetPresentation());
            }
          },
          pictogram: 'success',
          subtitle: t('itWalletHsm:presentation.successWithRedirect.subtitle'),
          title: t('itWalletHsm:presentation.successWithRedirect.title')
        }
      : {
          action: {
            accessibilityLabel: t('common:buttons.close'),
            label: t('common:buttons.close'),
            onPress: () => {
              navigateToWallet();
              dispatch(resetPresentation());
            }
          },
          pictogram: 'success',
          subtitle: t('itWalletHsm:presentation.success.subtitle'),
          title: t('itWalletHsm:presentation.success.title')
        };
  };

  const props = getPropsByResult();

  return <OperationResultScreenContent {...props} />;
};

export default PresentationSuccess;
