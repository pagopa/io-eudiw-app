import { ContentWrapper, VStack } from '@pagopa/io-app-design-system';
import { useTranslation } from 'react-i18next';

import { PoweredByItWalletText } from '../../components/PoweredByItWalletText';
import { ItwDiscoveryInfoBanner } from '../../components/presentation/ItwDiscoveryInfoBanner';
import { ItwPresentationDetailsHeader } from '../../components/presentation/ItwPresentationDetailsHeader';
import { ItwPresentationDetailsScreenBase } from '../../components/presentation/ItwPresentationDetailsScreenBase';
import { ItwPresentationPidDetail } from '../../components/presentation/ItwPresentationPidDetail';
import { ItwPresentationPidDetailFooter } from '../../components/presentation/ItwPresentationPidDetailFooter';
import { useAppSelector } from '../../store';
import {
  itwCredentialsPidSelector,
  selectPidInfoBannerActive
} from '../../store/credentials';
import { wellKnownCredential } from '../../utils/credentials';
import { getCredentialCapabilities } from '../../utils/itwCredentialCapabilities';
import { StoredCredentialMetadata } from '../../utils/itwTypesUtils';

export const ItwPresentationPidDetailScreen = () => {
  const pidOption = useAppSelector(itwCredentialsPidSelector);
  const pidInfoBannerActive = useAppSelector(selectPidInfoBannerActive);
  const { t } = useTranslation(['common']);

  const getContent = (credential: StoredCredentialMetadata) => (
    <ItwPresentationDetailsScreenBase credential={credential} headerTransparent>
      <ItwPresentationDetailsHeader
        capabilities={getCredentialCapabilities(wellKnownCredential.PID)}
        credential={credential}
      />
      <ContentWrapper>
        <VStack space={16} style={{ paddingVertical: 16 }}>
          {pidInfoBannerActive && <ItwDiscoveryInfoBanner />}
          <ItwPresentationPidDetail credential={credential} />
          <ItwPresentationPidDetailFooter
            successToastLabel={t('generics.success')}
          />
          <PoweredByItWalletText />
        </VStack>
      </ContentWrapper>
    </ItwPresentationDetailsScreenBase>
  );

  return pidOption ? getContent(pidOption) : null;
};
