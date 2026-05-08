import { ContentWrapper, VStack } from '@pagopa/io-app-design-system';
import { Canvas } from '@shopify/react-native-skia';
import { useWindowDimensions } from 'react-native';
import {
  ItwBrandedSkiaGradient,
  ItwSkiaBrandedGradientVariant
} from '../../components/ItwBrandedSkiaGradient';
import { PoweredByItWalletText } from '../../components/PoweredByItWalletText';
import { ItwPresentationDetailsScreenBase } from '../../components/presentation/ItwPresentationDetailsScreenBase';
import { ItwPresentationPidDetail } from '../../components/presentation/ItwPresentationPidDetail';
import { ItwPresentationPidDetailFooter } from '../../components/presentation/ItwPresentationPidDetailFooter';
import { ItwPresentationPidDetailHeader } from '../../components/presentation/ItwPresentationPidDetailHeader';
import {
  itwCredentialsPidSelector,
  itwCredentialsPidStatusSelector
} from '../../store/credentials';
import {
  ItwJwtCredentialStatus,
  StoredCredentialMetadata
} from '../../utils/itwTypesUtils';
import { useAppSelector } from '../../store';
import { useTranslation } from 'react-i18next';

export const ItwPresentationPidDetailScreen = () => {
  const pidOption = useAppSelector(itwCredentialsPidSelector);
  const { t } = useTranslation(['common']);

  const getContent = (credential: StoredCredentialMetadata) => (
    <ItwPresentationDetailsScreenBase credential={credential}>
      {/* Header with logo and description */}
      <ItwPresentationPidDetailHeader />

      {/* Brand gradient below header */}
      <PidStatusGradient />

      {/* Page content */}
      <ContentWrapper>
        <VStack style={{ paddingVertical: 16 }} space={16}>
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

const PidStatusGradient = () => {
  const { width } = useWindowDimensions();
  const pidStatus = useAppSelector(itwCredentialsPidStatusSelector);

  const borderVariantByPidStatus: Record<
    ItwJwtCredentialStatus,
    ItwSkiaBrandedGradientVariant
  > = {
    valid: 'default',
    jwtExpiring: 'warning',
    jwtExpired: 'error'
  };

  return (
    <Canvas style={{ width, height: 3 }}>
      <ItwBrandedSkiaGradient
        width={width}
        height={3}
        variant={borderVariantByPidStatus[pidStatus || 'valid']}
      />
    </Canvas>
  );
};
