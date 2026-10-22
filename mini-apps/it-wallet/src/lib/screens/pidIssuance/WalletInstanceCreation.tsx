import {
  AnimatedImage,
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
  useIOThemeContext,
  VSpacer,
  VStack
} from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { t } from 'i18next';
import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';

import Feature1Image from '../../../assets/img/discovery/feature_1.svg';
import Feature2Image from '../../../assets/img/discovery/feature_2.svg';
import Feature3Image from '../../../assets/img/discovery/feature_3.svg';
import Feature4Image from '../../../assets/img/discovery/feature_4.svg';
import Feature5Image from '../../../assets/img/discovery/feature_5.svg';
import { useItwDismissalDialog } from '../../hooks/useItwDismissalDialog';
import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';
import { createInstanceThunk } from '../../middleware/instance';
import MAIN_ROUTES from '../../navigation/main/routes';
import PID_ISSUANCE_ROUTES from '../../navigation/pidIssuance/routes';
import { useAppDispatch, useAppSelector } from '../../store';
import { resetInstanceCreation } from '../../store/pidIssuance';
import { selectInstanceStatus } from '../../store/selectors/pidIssuance';

const features = [
  { Image: Feature1Image, key: '1' },
  { Image: Feature2Image, key: '2' },
  { Image: Feature3Image, key: '3' },
  { Image: Feature4Image, key: '4' },
  { Image: Feature5Image, key: '5' }
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
      body: t('discovery.screen.itw.dismissalDialog.body', { ns: 'wallet' }),
      cancelLabel: t('discovery.screen.itw.dismissalDialog.cancel', {
        ns: 'wallet'
      }),
      confirmLabel: t('discovery.screen.itw.dismissalDialog.confirm', {
        ns: 'wallet'
      }),
      title: t('discovery.screen.itw.dismissalDialog.title', { ns: 'wallet' })
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
      navigation.navigate(MAIN_ROUTES.PID_ISSUANCE_NAV, {
        screen: PID_ISSUANCE_ROUTES.ID_METHOD
      });
      dispatch(resetInstanceCreation());
    }
  }, [success, navigation, dispatch]);

  useEffect(() => {
    if (error.status === true) {
      navigation.navigate(MAIN_ROUTES.PID_ISSUANCE_NAV, {
        screen: PID_ISSUANCE_ROUTES.FAILURE
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
          label: t('discovery.screen.itw.actions.primary', { ns: 'wallet' }),
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
        <H2>{t('discovery.screen.itw.title', { ns: 'wallet' })}</H2>
        <VSpacer size={24} />
        <VStack space={16}>
          {features.map(({ Image, key }) => (
            <FeatureBlock
              content={t(`discovery.screen.itw.features.${key}`, {
                ns: 'wallet'
              })}
              image={<Image height={48} width={48} />}
              key={key}
            />
          ))}
        </VStack>
        <VSpacer size={24} />
      </ContentWrapper>
    </IOScrollView>
  );
};

const HeroImage = () => {
  const { themeType } = useIOThemeContext();
  return (
    <AnimatedImage
      source={
        themeType === 'light'
          ? require('../../../assets/img/discovery/itw_hero.png')
          : require('../../../assets/img/discovery/itw_hero_dark.png')
      }
      style={styles.hero}
    />
  );
};

const FeatureBlock = (props: {
  content: string;
  image: React.ReactElement;
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
      <BodySmall style={{ flex: 1, flexWrap: 'wrap' }}>
        {props.content}
      </BodySmall>
    </HStack>
  );
};

const styles = StyleSheet.create({
  feature: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  hero: {
    aspectRatio: 4 / 3,
    height: 'auto',
    resizeMode: 'cover',
    width: '100%'
  }
});
