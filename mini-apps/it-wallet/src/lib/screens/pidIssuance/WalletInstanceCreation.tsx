import {
  AnimatedImage,
  IOMarkdown,
  IOScrollViewWithReveal,
  useDisableGestureNavigation,
  useHardwareBackButtonToDismiss,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
import {
  BodySmall,
  ContentWrapper,
  Divider,
  H2,
  H4,
  HStack,
  Icon,
  IOColors,
  IOIcons,
  useIOTheme,
  VSpacer,
  VStack
} from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { t } from 'i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedRef,
  useDerivedValue,
  useScrollOffset,
  useSharedValue
} from 'react-native-reanimated';

import Feature1Image from '../../../assets/img/discovery/feature_1.svg';
import Feature2Image from '../../../assets/img/discovery/feature_2.svg';
import Feature3Image from '../../../assets/img/discovery/feature_3.svg';
import { useItwDismissalDialog } from '../../hooks/useItwDismissalDialog';
import { useNavigateToWalletWithReset } from '../../hooks/useNavigateToWalletWithReset';
import { createInstanceThunk } from '../../middleware/instance';
import { useAppDispatch, useAppSelector } from '../../store';
import { resetInstanceCreation } from '../../store/pidIssuance';
import { selectInstanceStatus } from '../../store/selectors/pidIssuance';

// Offset to avoid to scroll to the block without margins
const scrollOffset = 12;
// Percentage of the visible block after which the anchor link is hidden
const intersectionRatio = 0.3;

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

  const [productHighlightsLayout, setProductHighlightsLayout] = useState({
    height: 0,
    y: 0
  });

  const productHighlightsRef = useRef<View>(null);
  const animatedRef = useAnimatedRef<Animated.ScrollView>();
  const scrollPosition = useScrollOffset(animatedRef);
  const hideAnchorLink = useSharedValue(false);

  useDerivedValue(() => {
    const threshold: number =
      productHighlightsLayout.height * (1 - intersectionRatio);

    if (productHighlightsLayout.y > 0) {
      hideAnchorLink.value =
        scrollPosition.value >= productHighlightsLayout.y - threshold;
    }
  });

  const handleScrollToHighlights = useCallback(() => {
    animatedRef.current?.scrollTo({
      animated: true,
      y: productHighlightsLayout.y - scrollOffset
    });
  }, [animatedRef, productHighlightsLayout]);

  const onPress = async () => {
    const promise = dispatch(createInstanceThunk());
    thunkRef.current = promise;
  };

  return (
    <IOScrollViewWithReveal
      actions={{
        anchor: {
          label: t('discovery.screen.itw.actions.anchor', {
            ns: 'wallet'
          }),
          onPress: handleScrollToHighlights
        },
        primary: {
          label: t('discovery.screen.itw.actions.primary', {
            ns: 'wallet'
          }),
          loading,
          onPress
        }
      }}
      animatedRef={animatedRef}
      hideAnchorAction={hideAnchorLink}
      testID="itwDiscoveryInfoComponentTestID"
    >
      <AnimatedImage
        source={require('../../../assets/img/discovery/itw_hero.png')}
        style={styles.hero}
      />
      <VSpacer size={24} />
      <ContentWrapper>
        <H2>
          {t('discovery.screen.itw.title', {
            ns: 'wallet'
          })}
        </H2>
        <VSpacer size={24} />
        <VStack space={16}>
          <FeatureBlock
            content={t('discovery.screen.itw.features.1', {
              ns: 'wallet'
            })}
            image={<Feature1Image height={48} width={48} />}
          />
          <FeatureBlock
            content={t('discovery.screen.itw.features.2', {
              ns: 'wallet'
            })}
            image={<Feature2Image height={48} width={48} />}
          />
          <FeatureBlock
            content={t('discovery.screen.itw.features.3', {
              ns: 'wallet'
            })}
            image={<Feature3Image height={48} width={48} />}
          />
        </VStack>
      </ContentWrapper>
      <VSpacer size={32} />
      <View
        onLayout={event => {
          setProductHighlightsLayout({
            height: event.nativeEvent.layout.height,
            y: event.nativeEvent.layout.y
          });
        }}
        ref={productHighlightsRef}
      >
        <ContentWrapper>
          <Divider />
          <DetailBlock
            content={t('discovery.screen.itw.details.1.content', {
              ns: 'wallet'
            })}
            icon="security"
            title={t('discovery.screen.itw.details.1.title', {
              ns: 'wallet'
            })}
          />
          <Divider />
          <DetailBlock
            content={t('discovery.screen.itw.details.2.content', {
              ns: 'wallet'
            })}
            icon="fiscalCodeIndividual"
            title={t('discovery.screen.itw.details.2.title', {
              ns: 'wallet'
            })}
          />
          <Divider />
          <DetailBlock
            content={t('discovery.screen.itw.details.3.content', {
              ns: 'wallet'
            })}
            icon="navQrWallet"
            title={t('discovery.screen.itw.details.3.title', {
              ns: 'wallet'
            })}
          />
          <Divider />
          <DetailBlock
            content={t('discovery.screen.itw.details.4.content', {
              ns: 'wallet'
            })}
            icon="euStars"
            title={t('discovery.screen.itw.details.4.title', {
              ns: 'wallet'
            })}
          />

          <VSpacer size={24} />
        </ContentWrapper>
      </View>
    </IOScrollViewWithReveal>
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

const DetailBlock = (props: {
  content: string;
  icon: IOIcons;
  title: string;
}) => {
  const theme = useIOTheme();

  return (
    <VStack space={8} style={styles.detail}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <H4>{props.title}</H4>
        <Icon
          color={theme['interactiveElem-default']}
          name={props.icon}
          size={24}
        />
      </View>
      <IOMarkdown content={props.content} />
    </VStack>
  );
};

const styles = StyleSheet.create({
  detail: {
    paddingVertical: 16
  },
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
