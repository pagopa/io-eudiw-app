import {
  AnimatedImage,
  IOMarkdown,
  IOScrollView,
  useDisableGestureNavigation,
  useHardwareBackButtonToDismiss,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
import {
  BodySmall,
  ContentWrapper,
  H2,
  HStack,
  IOColors,
  useIOTheme,
  VSpacer,
  VStack
} from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { t } from 'i18next';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import DrivingLicenseImage from '../../../assets/img/discovery/feature_1.svg';
import IdentityImage from '../../../assets/img/discovery/feature_2.svg';
import ServicesImage from '../../../assets/img/discovery/feature_3.svg';
import SecurityImage from '../../../assets/img/discovery/feature_4.svg';
import { useItwDismissalDialog } from '../../hooks/useItwDismissalDialog';
import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';
import { createInstanceThunk } from '../../middleware/instance';
import { useAppDispatch, useAppSelector } from '../../store';
import { resetInstanceCreation } from '../../store/pidIssuance';
import { selectInstanceStatus } from '../../store/selectors/pidIssuance';

const features = [
  { Image: SecurityImage, key: '1' },
  { Image: ServicesImage, key: '2' },
  { Image: IdentityImage, key: '3' },
  { Image: DrivingLicenseImage, key: '4' }
] as const;

type CreateInstancePromise = ReturnType<ReturnType<typeof createInstanceThunk>>;

/**
 * This is the component that shows the information about the activation of the wallet and creates the wallet instance.
 */
export const WalletInstanceCreation = () => {
  const navigation = useNavigation();
  const { error, loading, success } = useAppSelector(selectInstanceStatus);
  const dispatch = useAppDispatch();
  const { navigateToWallet } = useNavigateToWalletWithReset();

  const thunkRef = useRef<CreateInstancePromise | null>(null);

  const dismissalDialog = useItwDismissalDialog({
    customLabels: {
      body: t('discovery.screen.itw.dismissalDialog.body', { ns: 'hsm' }),
      cancelLabel: t('discovery.screen.itw.dismissalDialog.cancel', {
        ns: 'hsm'
      }),
      confirmLabel: t('discovery.screen.itw.dismissalDialog.confirm', {
        ns: 'hsm'
      }),
      title: t('discovery.screen.itw.dismissalDialog.title', { ns: 'hsm' })
    },
    handleDismiss: () => {
      thunkRef.current?.abort();
      navigateToWallet();
    }
  });

  useHardwareBackButtonToDismiss(() => dismissalDialog.show());
  useDisableGestureNavigation();

  useHeaderSecondLevel({
    goBack: () => dismissalDialog.show(),
    title: ''
  });

  useEffect(() => {
    if (success.status === true) {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'PID_ISSUANCE_ID_METHOD'
      });
      dispatch(resetInstanceCreation());
    }
  }, [success, navigation, dispatch]);

  useEffect(() => {
    if (error.status === true) {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'PID_ISSUANCE_FAILURE'
      });
    }
  }, [error, navigation]);

  const onPress = async () => {
    const promise = dispatch(createInstanceThunk());
    thunkRef.current = promise;
  };

  return (
    <IOScrollView
      actions={{
        primary: {
          label: t('discovery.screen.itw.actions.primary', { ns: 'hsm' }),
          loading,
          onPress
        },
        type: 'SingleButton'
      }}
      includeContentMargins={false}
      testID="itwDiscoveryInfoComponentTestID"
    >
      <HeroImage />
      <VSpacer size={24} />
      <ContentWrapper>
        <H2>{t('discovery.screen.itw.title', { ns: 'hsm' })}</H2>
        <VSpacer size={24} />
        <VStack space={16}>
          {features.map(({ Image, key }) => (
            <FeatureBlock
              content={t(`discovery.screen.itw.features.${key}.content`, {
                ns: 'hsm'
              })}
              image={<Image height={48} width={48} />}
              key={key}
              title={t(`discovery.screen.itw.features.${key}.title`, {
                ns: 'hsm'
              })}
            />
          ))}
        </VStack>
        <VSpacer size={48} />
        <IOMarkdown content={t('discovery.screen.itw.tos', { ns: 'hsm' })} />
        <VSpacer size={24} />
      </ContentWrapper>
    </IOScrollView>
  );
};

const HeroImage = () => (
  <AnimatedImage
    source={require('../../../assets/img/discovery/itw_hero.png')}
    style={styles.hero}
  />
);

const FeatureBlock = (props: {
  content: string;
  image: React.ReactElement;
  title: string;
}) => {
  const theme = useIOTheme();

  return (
    <HStack
      space={16}
      style={{
        ...styles.feature,
        borderColor: IOColors[theme['cardBorder-default']]
      }}
    >
      {props.image}
      <View style={styles.featureText}>
        <BodySmall weight="Semibold">{props.title}</BodySmall>
        <BodySmall>{props.content}</BodySmall>
      </View>
    </HStack>
  );
};

const styles = StyleSheet.create({
  feature: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 8,
    borderWidth: 1,
    padding: 8
  },
  featureText: {
    flex: 1
  },
  hero: {
    aspectRatio: 4 / 3,
    height: 'auto',
    resizeMode: 'cover',
    width: '100%'
  }
});
