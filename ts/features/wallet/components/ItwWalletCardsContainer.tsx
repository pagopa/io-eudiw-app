import { VSpacer } from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDebugInfo } from '../../../hooks/useDebugInfo';
import { useAppSelector } from '../../../store';
import { ItwJwtCredentialStatus } from '../utils/itwTypesUtils';
import {
  itwCredentialsPidExpirationSelector,
  itwCredentialsPidStatusSelector,
  selectWalletCards
} from '../store/credentials';
import WALLET_ROUTES from '../navigation/routes';
import MAIN_ROUTES from '../../../navigation/main/routes';
import { MainNavigatorParamsList } from '../../../navigation/main/MainStackNavigator';
import { ItwPidLifecycleAlert } from './ItwPidLifecycleAlert';
import { ItwWalletReadyBanner } from './ItwWalletReadyBanner';
import { ItwWalletIdStatus } from './ItwWalletIdStatus';
import { WalletCardsCategoryContainer } from './WalletCardsCategoryContainer';

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
        />
        <VSpacer size={16} />
      </>
    ),
    [pidStatus, pidExpiration, handleNavigateToItwId]
  );

  return (
    <>
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
    </>
  );
};
