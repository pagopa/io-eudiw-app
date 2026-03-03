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
import { AnimatedImage } from '../../../../components/AnimatedImage';
import IOMarkdown from '../../../../components/IOMarkdown';
import { IOScrollViewWithReveal } from '../../../../components/IOScrollViewWithReveal';
import { useDisableGestureNavigation } from '../../../../hooks/useDisableGestureNavigation';
import { useHardwareBackButtonToDismiss } from '../../../../hooks/useHardwareBackButton';
import { useHeaderSecondLevel } from '../../../../hooks/useHeaderSecondLevel';
import Feature1Image from '../../assets/img/discovery/feature_1.svg';
import Feature2Image from '../../assets/img/discovery/feature_2.svg';
import Feature3Image from '../../assets/img/discovery/feature_3.svg';
import Feature4Image from '../../assets/img/discovery/feature_4.svg';
import Feature5Image from '../../assets/img/discovery/feature_5.svg';
import { useItwDismissalDialog } from '../../hooks/useItwDismissalDialog';
import { createInstanceThunk } from '../../middleware/instance';
import { resetInstanceCreation } from '../../store/pidIssuance';
import { selectInstanceStatus } from '../../store/selectors/pidIssuance';
import { generateItwIOMarkdownRules } from '../../utils/markdown';
import { useAppDispatch, useAppSelector } from '@/ts/store';

// Offset to avoid to scroll to the block without margins
const scrollOffset: number = 12;
// Percentage of the visible block after which the anchor link is hidden
const intersectionRatio: number = 0.3;

type CreateInstancePromise = ReturnType<ReturnType<typeof createInstanceThunk>>;

/**
 * This is the component that shows the information about the activation of the wallet and creates the wallet instance.
 */
export const WalletInstanceCreation = () => {
  const navigation = useNavigation();
  const { error, success, loading } = useAppSelector(selectInstanceStatus);
  const dispatch = useAppDispatch();

  const thunkRef = useRef<CreateInstancePromise | null>(null);

  const dismissalDialog = useItwDismissalDialog({
    customLabels: {
      title: t('discovery.screen.itw.dismissalDialog.title', {
        ns: 'wallet'
      }),
      body: t('discovery.screen.itw.dismissalDialog.body', {
        ns: 'wallet'
      }),
      confirmLabel: t('discovery.screen.itw.dismissalDialog.confirm', {
        ns: 'wallet'
      }),
      cancelLabel: t('discovery.screen.itw.dismissalDialog.cancel', {
        ns: 'wallet'
      })
    },
    handleDismiss: () => {
      thunkRef.current?.abort();
      navigation.goBack();
    }
  });

  useHardwareBackButtonToDismiss(() => dismissalDialog.show());
  useDisableGestureNavigation();

  useHeaderSecondLevel({
    title: '',
    goBack: () => dismissalDialog.show()
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
    y: 0,
    height: 0
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
      y: productHighlightsLayout.y - scrollOffset,
      animated: true
    });
  }, [animatedRef, productHighlightsLayout]);

  const onPress = async () => {
    const promise = dispatch(createInstanceThunk());
    thunkRef.current = promise;
  };

  return (
    <IOScrollViewWithReveal
      testID="itwDiscoveryInfoComponentTestID"
      animatedRef={animatedRef}
      hideAnchorAction={hideAnchorLink}
      actions={{
        primary: {
          loading,
          label: t('discovery.screen.itw.actions.primary', {
            ns: 'wallet'
          }),
          onPress
        },
        anchor: {
          label: t('discovery.screen.itw.actions.anchor', {
            ns: 'wallet'
          }),
          onPress: handleScrollToHighlights
        }
      }}
    >
      <AnimatedImage
        source={require('../../assets/img/discovery/itw_hero.png')}
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
            image={<Feature1Image width={48} height={48} />}
            content={t('discovery.screen.itw.features.1', {
              ns: 'wallet'
            })}
          />
          <FeatureBlock
            image={<Feature2Image width={48} height={48} />}
            content={t('discovery.screen.itw.features.2', {
              ns: 'wallet'
            })}
          />
          <FeatureBlock
            image={<Feature3Image width={48} height={48} />}
            content={t('discovery.screen.itw.features.3', {
              ns: 'wallet'
            })}
          />
          <FeatureBlock
            image={<Feature4Image width={48} height={48} />}
            content={t('discovery.screen.itw.features.4', {
              ns: 'wallet'
            })}
          />
          <FeatureBlock
            image={<Feature5Image width={48} height={48} />}
            content={t('discovery.screen.itw.features.5', {
              ns: 'wallet'
            })}
          />
        </VStack>
      </ContentWrapper>
      <VSpacer size={32} />
      <View
        ref={productHighlightsRef}
        onLayout={event => {
          setProductHighlightsLayout({
            y: event.nativeEvent.layout.y,
            height: event.nativeEvent.layout.height
          });
        }}
      >
        <ContentWrapper>
          <Divider />
          <DetailBlock
            title={t('discovery.screen.itw.details.1.title', {
              ns: 'wallet'
            })}
            content={t('discovery.screen.itw.details.1.content', {
              ns: 'wallet'
            })}
            icon="security"
          />
          <Divider />
          <DetailBlock
            title={t('discovery.screen.itw.details.2.title', {
              ns: 'wallet'
            })}
            content={t('discovery.screen.itw.details.2.content', {
              ns: 'wallet'
            })}
            icon="fiscalCodeIndividual"
          />
          <Divider />
          <DetailBlock
            title={t('discovery.screen.itw.details.3.title', {
              ns: 'wallet'
            })}
            content={t('discovery.screen.itw.details.3.content', {
              ns: 'wallet'
            })}
            icon="navQrWallet"
          />
          <Divider />
          <DetailBlock
            title={t('discovery.screen.itw.details.4.title', {
              ns: 'wallet'
            })}
            content={t('discovery.screen.itw.details.4.content', {
              ns: 'wallet'
            })}
            icon="euStars"
          />

          <VSpacer size={24} />
          <IOMarkdown
            content={t('discovery.screen.itw.tos', { ns: 'wallet' })}
            rules={generateItwIOMarkdownRules({
              linkCallback: () => null,
              paragraphSize: 'small'
            })}
          />
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
  title: string;
  content: string;
  icon: IOIcons;
}) => {
  const theme = useIOTheme();

  return (
    <VStack space={8} style={styles.detail}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <H4>{props.title}</H4>
        <Icon
          name={props.icon}
          size={24}
          color={theme['interactiveElem-default']}
        />
      </View>
      <IOMarkdown content={props.content} />
    </VStack>
  );
};

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    height: 'auto',
    resizeMode: 'cover',
    aspectRatio: 4 / 3
  },
  feature: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    borderCurve: 'continuous'
  },
  detail: {
    paddingVertical: 16
  }
});
