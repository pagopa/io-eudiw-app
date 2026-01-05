import { VSpacer } from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDebugInfo } from '../../../hooks/useDebugInfo';
import { useAppSelector } from '../../../store';
import { ItwJwtCredentialStatus } from '../utils/itwTypesUtils';
import {
  itwCredentialsEidExpirationSelector,
  itwCredentialsEidStatusSelector,
  selectWalletCards
} from '../store/credentials';
import WALLET_ROUTES from '../navigation/routes';
import MAIN_ROUTES from '../../../navigation/main/routes';
import { wellKnownCredential } from '../utils/credentials';
import { MainNavigatorParamsList } from '../../../navigation/main/MainStackNavigator';
import { ItwEidLifecycleAlert } from './ItwEidLifecycleAlert';
import { ItwWalletReadyBanner } from './ItwWalletReadyBanner';
import { ItwWalletIdStatus } from './ItwWalletIdStatus';
import { WalletCardsCategoryContainer } from './WalletCardsCategoryContainer';

const LIFECYCLE_STATUS: Array<ItwJwtCredentialStatus> = [
  'jwtExpiring',
  'jwtExpired'
];

// TODO is withWalletCategoryFilter necessary ?
export const ItwWalletCardsContainer = () => {
  const navigation =
    useNavigation<StackNavigationProp<MainNavigatorParamsList>>();
  const cards = useAppSelector(selectWalletCards);
  const eidStatus = useAppSelector(itwCredentialsEidStatusSelector);
  const eidExpiration = useAppSelector(itwCredentialsEidExpirationSelector);

  useDebugInfo({
    itw: {
      eidStatus,
      eidExpiration,
      cards
    }
  });

  const handleNavigateToItwId = useCallback(() => {
    navigation.navigate(MAIN_ROUTES.WALLET_NAV, {
      screen: WALLET_ROUTES.PRESENTATION.CREDENTIAL_DETAILS,
      params: {
        credentialType: wellKnownCredential.PID
      }
    });
  }, [navigation]);

  const sectionHeader = useMemo(
    (): React.ReactElement => (
      <>
        <ItwWalletIdStatus
          pidStatus={eidStatus}
          pidExpiration={eidExpiration}
          onPress={handleNavigateToItwId}
        />
        <VSpacer size={16} />
      </>
    ),
    [eidStatus, eidExpiration, handleNavigateToItwId]
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
            <ItwEidLifecycleAlert
              lifecycleStatus={LIFECYCLE_STATUS}
              navigation={navigation}
            />
          </>
        }
      />
    </>
  );
};
