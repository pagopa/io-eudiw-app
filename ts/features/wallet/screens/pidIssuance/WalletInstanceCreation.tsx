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
import I18n from 'i18next';
import {useCallback, useEffect, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {
  useAnimatedRef,
  useDerivedValue,
  useScrollViewOffset,
  useSharedValue
} from 'react-native-reanimated';
import {useNavigation} from '@react-navigation/native';
import Feature1Image from '../../../../../img/features/itWallet/discovery/feature_1.svg';
import Feature2Image from '../../../../../img/features/itWallet/discovery/feature_2.svg';
import Feature3Image from '../../../../../img/features/itWallet/discovery/feature_3.svg';
import Feature4Image from '../../../../../img/features/itWallet/discovery/feature_4.svg';
import Feature5Image from '../../../../../img/features/itWallet/discovery/feature_5.svg';
import {AnimatedImage} from '../../../../components/AnimatedImage.tsx';

import {useAppDispatch, useAppSelector} from '../../../../store/index.ts';
import {
  resetInstanceCreation,
  selectInstanceStatus,
  setInstanceCreationRequest
} from '../../store/pidIssuance.ts';
import {useItwDismissalDialog} from '../../hook/useItwDismissalDialog.tsx';
import {useHeaderSecondLevel} from '../../../../hooks/useHeaderSecondLevel.tsx';
import {IOScrollViewWithReveal} from '../../../../components/IOScrollViewWithReveal.tsx';
import IOMarkdown from '../../../../components/IOMarkdown/index.tsx';
import {generateItwIOMarkdownRules} from '../../utils/markdown.ts';

// Offset to avoid to scroll to the block without margins
const scrollOffset: number = 12;
// Percentage of the visible block after which the anchor link is hidden
const intersectionRatio: number = 0.3;

/**
 * This is the component that shows the information about the activation of
 * IT-Wallet. Must be used only for L3 activations.
 */
export const WalletInstanceCreation = () => {
  const navigation = useNavigation();
  const {error, success, loading} = useAppSelector(selectInstanceStatus);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (error.status === true) {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'PID_ISSUANCE_FAILURE'
      });
    }
  }, [error, navigation]);

  const dismissalDialog = useItwDismissalDialog({
    customLabels: {
      title: I18n.t(
        'features.itWallet.discovery.screen.itw.dismissalDialog.title'
      ),
      body: I18n.t(
        'features.itWallet.discovery.screen.itw.dismissalDialog.body'
      ),
      confirmLabel: I18n.t(
        'features.itWallet.discovery.screen.itw.dismissalDialog.confirm'
      ),
      cancelLabel: I18n.t(
        'features.itWallet.discovery.screen.itw.dismissalDialog.cancel'
      )
    }
  });

  useEffect(() => {
    if (success.status === true) {
      navigation.navigate('MAIN_WALLET_NAV', {
        screen: 'PID_ISSUANCE_REQUEST'
      });
      dispatch(resetInstanceCreation());
    }
  }, [success, navigation, dispatch]);

  useHeaderSecondLevel({
    title: '',
    goBack: () => {
      dismissalDialog.show();
    }
  });

  const [productHighlightsLayout, setProductHighlightsLayout] = useState({
    y: 0,
    height: 0
  });

  const productHighlightsRef = useRef<View>(null);
  const animatedRef = useAnimatedRef<Animated.ScrollView>();
  const scrollPosition = useScrollViewOffset(animatedRef);
  const hideAnchorLink = useSharedValue(false);

  useDerivedValue(() => {
    const threshold: number =
      productHighlightsLayout.height * (1 - intersectionRatio);

    if (productHighlightsLayout.y > 0) {
      // eslint-disable-next-line functional/immutable-data
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

  return (
    <IOScrollViewWithReveal
      testID="itwDiscoveryInfoComponentTestID"
      animatedRef={animatedRef}
      hideAnchorAction={hideAnchorLink}
      actions={{
        primary: {
          loading,
          label: I18n.t(
            'features.itWallet.discovery.screen.itw.actions.primary'
          ),
          onPress: () => dispatch(setInstanceCreationRequest())
        },
        anchor: {
          label: I18n.t(
            'features.itWallet.discovery.screen.itw.actions.anchor'
          ),
          onPress: handleScrollToHighlights
        }
      }}>
      <AnimatedImage
        source={require('../../assets/img/itw_hero.png')}
        style={styles.hero}
      />
      <VSpacer size={24} />
      <ContentWrapper>
        <H2>{I18n.t('features.itWallet.discovery.screen.itw.title')}</H2>
        <VSpacer size={24} />
        <VStack space={16}>
          <FeatureBlock
            image={<Feature1Image width={48} height={48} />}
            content={I18n.t(
              'features.itWallet.discovery.screen.itw.features.1'
            )}
          />
          <FeatureBlock
            image={<Feature2Image width={48} height={48} />}
            content={I18n.t(
              'features.itWallet.discovery.screen.itw.features.2'
            )}
          />
          <FeatureBlock
            image={<Feature3Image width={48} height={48} />}
            content={I18n.t(
              'features.itWallet.discovery.screen.itw.features.3'
            )}
          />
          <FeatureBlock
            image={<Feature4Image width={48} height={48} />}
            content={I18n.t(
              'features.itWallet.discovery.screen.itw.features.4'
            )}
          />
          <FeatureBlock
            image={<Feature5Image width={48} height={48} />}
            content={I18n.t(
              'features.itWallet.discovery.screen.itw.features.5'
            )}
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
        }}>
        <ContentWrapper>
          <Divider />
          <DetailBlock
            title={I18n.t(
              'features.itWallet.discovery.screen.itw.details.1.title'
            )}
            content={I18n.t(
              'features.itWallet.discovery.screen.itw.details.1.content'
            )}
            icon="security"
          />
          <Divider />
          <DetailBlock
            title={I18n.t(
              'features.itWallet.discovery.screen.itw.details.2.title'
            )}
            content={I18n.t(
              'features.itWallet.discovery.screen.itw.details.2.content'
            )}
            icon="fiscalCodeIndividual"
          />
          <Divider />
          <DetailBlock
            title={I18n.t(
              'features.itWallet.discovery.screen.itw.details.3.title'
            )}
            content={I18n.t(
              'features.itWallet.discovery.screen.itw.details.3.content'
            )}
            icon="navQrWallet"
          />
          <Divider />
          <DetailBlock
            title={I18n.t(
              'features.itWallet.discovery.screen.itw.details.4.title'
            )}
            content={I18n.t(
              'features.itWallet.discovery.screen.itw.details.4.content'
            )}
            icon="euStars"
          />

          <VSpacer size={24} />
          <IOMarkdown
            content={I18n.t('discovery.screen.itw.tos', {ns: 'wallet'})}
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

const FeatureBlock = (props: {content: string; image: React.ReactElement}) => {
  const theme = useIOTheme();

  return (
    <HStack
      space={16}
      style={{
        ...styles.feature,
        borderColor: IOColors[theme['cardBorder-default']]
      }}>
      {props.image}
      <BodySmall style={{flex: 1, flexWrap: 'wrap'}}>{props.content}</BodySmall>
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
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
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
