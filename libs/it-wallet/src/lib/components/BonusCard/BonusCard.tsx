import {
  Avatar,
  BodySmall,
  H2,
  HSpacer,
  IOColors,
  IOSkeleton,
  VSpacer
} from '@pagopa/io-app-design-system';

import { createRef, Fragment, ReactNode } from 'react';
import { Image, ImageURISource, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BonusCardCounter, BonusCardCounterProps } from './BonusCardCounter';
import { BonusCardStatus } from './BonusCardStatus';

type BaseProps = {
  // For devices with small screens you may need to hide the logo to get more space
  hideLogo?: boolean;
};

export type BonusCardColorSchemeValues = {
  background: string;
  // Skeleton or other visual elements
  foreground: string;
  text: IOColors;
};

type ContentProps = {
  logoUris?: Array<ImageURISource | number>;
  name: string;
  organizationName: string;
  status: ReactNode;
  counters?: ReadonlyArray<BonusCardCounterProps>;
  cardFooter?: ReactNode;
};

type LoadingStateProps =
  | { isLoading: true }
  | ({ isLoading?: never } & ContentProps);

export type BonusCardProps = BaseProps & LoadingStateProps;

export type BonusCardWithColorSchemeValues = BonusCardProps & {
  cardColorSchemeValues: BonusCardColorSchemeValues;
};

const BonusCardContent = (props: BonusCardWithColorSchemeValues) => {
  const bonusNameHeadingRef = createRef<View>();

  if (props.isLoading) {
    return <BonusCardSkeleton {...props} />;
  }

  const {
    hideLogo,
    logoUris,
    name,
    organizationName,
    status,
    counters,
    cardFooter,
    cardColorSchemeValues
  } = props;

  return (
    <View style={styles.content} testID="BonusCardContentTestID">
      {!hideLogo && (
        <>
          <View style={styles.logos}>
            {logoUris?.map((logoUri, index) => (
              <Avatar key={index} size="medium" logoUri={logoUri} />
            ))}
          </View>
          <VSpacer size={16} />
        </>
      )}
      <H2
        ref={bonusNameHeadingRef}
        role="heading"
        color={cardColorSchemeValues.text}
        style={{ textAlign: 'center' }}
      >
        {name}
      </H2>
      <VSpacer size={4} />
      <BodySmall
        weight="Regular"
        color={cardColorSchemeValues.text}
        style={{ textAlign: 'center', marginHorizontal: 16 }}
      >
        {organizationName}
      </BodySmall>
      <VSpacer size={16} />
      <BonusCardStatus>{status}</BonusCardStatus>
      <VSpacer size={16} />
      {counters && (
        <View style={styles.counters}>
          {counters.map((counter, index) => {
            const isLast = index === counters.length - 1;
            return (
              <Fragment key={`${counter.label}_${index}`}>
                <BonusCardCounter {...counter} />
                {!isLast && <HSpacer size={16} />}
              </Fragment>
            );
          })}
        </View>
      )}
      {cardFooter}
    </View>
  );
};

export const BonusCard = (props: BonusCardWithColorSchemeValues) => {
  const safeAreaInsets = useSafeAreaInsets();

  // If the logo is hidden, this margin prevents content shift when mutating from a loading state
  const hiddenLogoLoadingMargin = props.hideLogo && props.isLoading ? 8 : 0;
  // This padding is necessary to get enough space on top to display the header
  const paddingTop = safeAreaInsets.top + hiddenLogoLoadingMargin + 64;

  return (
    <View style={[styles.container, { paddingTop }]}>
      <View
        style={[
          styles.background,
          { backgroundColor: props.cardColorSchemeValues.background }
        ]}
      >
        {!props.isLoading && (
          <Image
            source={require('../../../assets/img/credential/bonus_pari.png')}
            style={styles.backgroundImage}
          />
        )}
      </View>
      <BonusCardContent {...props} />
    </View>
  );
};

const BonusCardSkeleton = (props: BonusCardWithColorSchemeValues) => {
  const foregroundColor = props.cardColorSchemeValues.foreground;

  return (
    <View style={styles.content} testID="BonusCardSkeletonTestID">
      {!props.hideLogo && (
        <>
          <IOSkeleton
            color={foregroundColor}
            shape="square"
            size={66}
            radius={8}
          />
          <VSpacer size={24} />
        </>
      )}
      <IOSkeleton
        color={foregroundColor}
        shape="rectangle"
        height={28}
        width={198}
        radius={28}
      />
      <VSpacer size={8} />
      <IOSkeleton
        color={foregroundColor}
        shape="rectangle"
        height={28}
        width={108}
        radius={28}
      />
      <VSpacer size={16} />
      <BonusCardStatus isLoading={true} skeletonColor={foregroundColor} />
      <VSpacer size={16} />
      <View style={styles.counters}>
        <BonusCardCounter
          type="ValueWithProgress"
          isLoading={true}
          skeletonColor={foregroundColor}
        />
        <HSpacer size={16} />
        <BonusCardCounter
          type="Value"
          isLoading={true}
          skeletonColor={foregroundColor}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 8,
    paddingBottom: 24,
    overflow: 'hidden',
    borderRadius: 16
  },
  background: {
    ...StyleSheet.absoluteFillObject
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  content: {
    alignItems: 'center'
  },
  counters: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  logos: {
    flexDirection: 'row',
    columnGap: 8
  }
});
