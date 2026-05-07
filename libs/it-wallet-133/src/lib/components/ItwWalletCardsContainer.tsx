import { VSpacer } from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCallback, useMemo } from 'react';
import WALLET_ROUTES from '../navigation/wallet/routes';
import {
  itwCredentialsPidExpirationSelector,
  itwCredentialsPidStatusSelector,
  selectWalletCards
} from '../store/credentials';
import { ItwJwtCredentialStatus } from '../utils/itwTypesUtils';
import { ItwPidLifecycleAlert } from './ItwPidLifecycleAlert';
import { ItwWalletIdStatus } from './ItwWalletIdStatus';
import { ItwWalletReadyBanner } from './ItwWalletReadyBanner';
import { WalletCardsCategoryContainer } from './WalletCardsCategoryContainer';
import { useAppSelector } from '../store';
import { useDebugInfo } from '@io-eudiw-app/debug-info';
import { MainNavigatorParamsList } from '../navigation/main/MainStackNavigator';
import MAIN_ROUTES from '../navigation/main/routes';
import { useTranslation } from 'react-i18next';

const LIFECYCLE_STATUS: Array<ItwJwtCredentialStatus> = [
  'jwtExpiring',
  'jwtExpired'
];

export const ItwWalletCardsContainer = () => {
  const navigation =
    useNavigation<StackNavigationProp<MainNavigatorParamsList>>();
  const cards = useAppSelector(selectWalletCards);
  const pidStatus = useAppSelector(itwCredentialsPidStatusSelector);
  const pidExpiration = useAppSelector(itwCredentialsPidExpirationSelector);
  const { t } = useTranslation(['common']);

  useDebugInfo({
    itw: {
      pidStatus,
      pidExpiration,
      cards
    }
  });

  const handleNavigateToItwId = useCallback(() => {
    navigation.navigate(MAIN_ROUTES.WALLET_NAV, {
      screen: WALLET_ROUTES.PRESENTATION.PID_DETAIL
    });
  }, [navigation]);

  const sectionHeader = useMemo(
    (): React.ReactElement => (
      <>
        <ItwWalletIdStatus
          pidStatus={pidStatus}
          pidExpiration={pidExpiration}
          onPress={handleNavigateToItwId}
          startButtonLabel={t('buttons.start')}
        />
        <VSpacer size={16} />
      </>
    ),
    [pidStatus, pidExpiration, handleNavigateToItwId, t]
  );

  return (
    <WalletCardsCategoryContainer
      key={`cards_category_itw`}
      testID={`itwWalletCardsContainerTestID`}
      cards={cards}
      header={sectionHeader}
      topElement={
        <>
          <ItwWalletReadyBanner />
          <ItwPidLifecycleAlert
            lifecycleStatus={LIFECYCLE_STATUS}
            navigation={navigation}
          />
        </>
      }
    />
  );
};
