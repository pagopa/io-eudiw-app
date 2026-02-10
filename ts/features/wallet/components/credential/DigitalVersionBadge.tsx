import {
  IOBadgeHSpacing,
  IOBadgeRadius,
  IOBadgeVSpacing,
  IOColors,
  makeFontStyleObject
} from '@pagopa/io-app-design-system';
import {
  Canvas,
  LinearGradient,
  RoundedRect,
  vec
} from '@shopify/react-native-skia';
import Color from 'color';
import { memo, useState } from 'react';
import {
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { t } from 'i18next';
import { useAppSelector } from '../../../../store';
import { fontPreferenceSelector } from '../../../../store/reducers/preferences';
import { CardColorScheme } from '../../types';

type DigitalVersionBadgeProps = {
  credentialType: string;
  colorScheme: CardColorScheme;
};

type CredentialTypesProps = {
  background: string | Array<string>;
  foreground: string;
};

const getColorPropsByScheme = (
  credentialType: string,
  colorScheme: CardColorScheme
) => {
  const mapCredentialTypes: Record<string, CredentialTypesProps> = {
    'org.iso.18013.5.1.mDL': {
      foreground: '#5E303E',
      background: '#FADCF5'
    },
    'urn:eu.europa.ec.eudi:edc:1': {
      foreground: '#01527F',
      background: '#E8EEF4'
    },
    education_degree: {
      foreground: '#403C36',
      background: ['#ECECEC', '#F2F1CE']
    },
    education_enrollment: {
      foreground: '#403C36',
      background: ['#ECECEC', '#E0F2CE']
    },
    residency: {
      foreground: '#403C36',
      background: ['#ECECEC', '#F2E4CE']
    }
  };

  const baseColorProps = mapCredentialTypes[credentialType];
  if (!baseColorProps) {
    return;
  }

  if (colorScheme === 'greyscale') {
    if (Array.isArray(baseColorProps.background)) {
      return {
        foreground: Color(baseColorProps.foreground).grayscale().hex(),
        background: baseColorProps.background.map(c =>
          Color(c).grayscale().hex()
        )
      };
    }
    return {
      foreground: Color(baseColorProps.foreground).grayscale().hex(),
      background: Color(baseColorProps.background).grayscale().hex()
    };
  }

  return baseColorProps;
};

const DigitalVersionBadge = ({
  credentialType,
  colorScheme = 'default'
}: DigitalVersionBadgeProps) => {
  const typefacePreference = useAppSelector(fontPreferenceSelector);
  const [layout, setLayout] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const colorProps = getColorPropsByScheme(credentialType, colorScheme);

  // If a credential does not have the color configuration means that we should not display the badge
  if (!colorProps) {
    return null;
  }

  const { background, foreground } = colorProps;
  const isGradient = Array.isArray(background);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  };

  return (
    <View style={styles.wrapper}>
      <View
        onLayout={handleLayout}
        style={[
          styles.badge,
          {
            backgroundColor: isGradient ? undefined : background
          }
        ]}
      >
        {isGradient && layout && (
          <Canvas style={styles.gradientCanvas}>
            <RoundedRect
              x={0}
              y={0}
              width={layout.width}
              height={layout.height}
              r={IOBadgeRadius}
            >
              <LinearGradient
                start={vec(0, 0)}
                end={vec(layout.width, 0)}
                colors={background}
              />
            </RoundedRect>
          </Canvas>
        )}
        {colorScheme !== 'default' && <View style={styles.faded} />}
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          allowFontScaling={false}
          style={{
            color: foreground,
            alignSelf: 'center',
            textTransform: 'uppercase',
            flexShrink: 1,
            zIndex: 20,
            ...makeFontStyleObject(
              12,
              typefacePreference === 'comfortable'
                ? 'Titillio'
                : 'TitilliumSansPro',
              16,
              'Semibold'
            )
          }}
        >
          {`${t('credentials.digital', { ns: 'wallet' })}`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 16,
    right: 2
  },
  badge: {
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      android: {
        textAlignVertical: 'center'
      }
    }),
    borderCurve: 'continuous',
    borderRadius: IOBadgeRadius,
    paddingHorizontal: IOBadgeHSpacing,
    paddingVertical: IOBadgeVSpacing,
    paddingEnd: IOBadgeHSpacing + 8,
    marginEnd: -IOBadgeHSpacing
  },
  faded: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: IOColors.white,
    opacity: 0.6,
    zIndex: 10
  },
  gradientCanvas: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0
  }
});

const MemoizedDigitalVersionBadge = memo(DigitalVersionBadge);

export { MemoizedDigitalVersionBadge as DigitalVersionBadge };
