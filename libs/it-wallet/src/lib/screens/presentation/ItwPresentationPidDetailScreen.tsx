import { ContentWrapper, VStack } from '@pagopa/io-app-design-system';
import { PoweredByItWalletText } from '../../components/PoweredByItWalletText';
import { ItwPresentationDetailsScreenBase } from '../../components/presentation/ItwPresentationDetailsScreenBase';
import { ItwPresentationPidDetail } from '../../components/presentation/ItwPresentationPidDetail';
import { ItwPresentationPidDetailFooter } from '../../components/presentation/ItwPresentationPidDetailFooter';
import {
  itwCredentialsPidSelector,
  selectPidInfoBannerActive
} from '../../store/credentials';
import { StoredCredentialMetadata } from '../../utils/itwTypesUtils';
import { useAppSelector } from '../../store';
import { useTranslation } from 'react-i18next';
import { ItwPresentationDetailsHeader } from '../../components/presentation/ItwPresentationDetailsHeader';
import { getCredentialCapabilities } from '../../utils/itwCredentialCapabilities';
import { wellKnownCredential } from '../../utils/credentials';
import { ItwDiscoveryInfoBanner } from '../../components/presentation/ItwDiscoveryInfoBanner';

export const ItwPresentationPidDetailScreen = () => {
  const pidOption = useAppSelector(itwCredentialsPidSelector);
  const pidInfoBannerActive = useAppSelector(selectPidInfoBannerActive);
  const { t } = useTranslation(['common']);

  const getContent = (credential: StoredCredentialMetadata) => (
    <ItwPresentationDetailsScreenBase credential={credential} headerTransparent>
      <ItwPresentationDetailsHeader
        credential={credential}
        capabilities={getCredentialCapabilities(wellKnownCredential.PID)}
      />
      <ContentWrapper>
        <VStack style={{ paddingVertical: 16 }} space={16}>
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
