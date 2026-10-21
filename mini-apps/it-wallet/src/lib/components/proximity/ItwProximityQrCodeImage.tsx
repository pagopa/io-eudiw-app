import {
  Body,
  Icon,
  IOButton,
  IOColors,
  IOSkeleton,
  IOVisualCostants,
  useIOTheme
} from '@pagopa/io-app-design-system';
import I18n from 'i18next';
import { useCallback } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-skia';
import Animated, { FadeIn } from 'react-native-reanimated';

import ItwAvatar from '../../../assets/img/brand/itw_avatar.svg';
import { useProximityEngagement } from '../../hooks/useProximityEngagement';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  resetProximity,
  selectProximityFailure,
  selectProximityQrCode,
  setProximityStatusStopped
} from '../../store/proximity';
import { ITW_BRANDED_BOX_PADDING } from '../ItwBrandedBox';

const QR_CODE_LOGO_SIZE = 84;

/**
 * For the QR Code size, we start from the window width and subtract the
 * horizontal screen padding and the branded box padding (both sides).
 */
const WINDOW_WIDTH = Dimensions.get('window').width;

const QR_CODE_SIZE =
  WINDOW_WIDTH -
  IOVisualCostants.appMarginDefault * 2 - // horizontal screen padding (both sides)
  ITW_BRANDED_BOX_PADDING * 2; // branded box padding (both sides)

/**
 * Renders the proximity engagement QR Code using the skia renderer (circle dots
 * + IT-Wallet logo), reading the QR string from the proximity store. While the
 * QR string is being generated a square skeleton is shown.
 */
export const ItwProximityQrCodeImage = () => {
  const theme = useIOTheme();
  const qrCode = useAppSelector(selectProximityQrCode);

  const { startQrVerification } = useProximityEngagement();
  const proximityFailure = useAppSelector(selectProximityFailure);
  const dispatch = useAppDispatch();

  const handleRetry = useCallback(() => {
    dispatch(setProximityStatusStopped());
    dispatch(resetProximity());
    void startQrVerification();
  }, [dispatch, startQrVerification]);

  if (proximityFailure) {
    return (
      <StatusBox
        action={
          <View style={styles.retryActionContainer}>
            <IOButton
              label={I18n.t('buttons.retry', { ns: 'common' })}
              onPress={handleRetry}
              variant="link"
            />
          </View>
        }
        description={I18n.t('proximity.engagement.qrCode.error', {
          ns: 'wallet'
        })}
        iconName="warningFilled"
      />
    );
  }

  if (!qrCode) {
    return <IOSkeleton radius={16} shape="square" size={QR_CODE_SIZE} />;
  }

  return (
    <Animated.View entering={FadeIn.duration(200)}>
      <QRCode
        color={theme['textBody-default']}
        errorCorrectionLevel="H"
        logo={
          <ItwAvatar height={QR_CODE_LOGO_SIZE} width={QR_CODE_LOGO_SIZE} />
        }
        logoAreaBorderRadius={8}
        logoAreaSize={88}
        shapeOptions={{
          eyePatternGap: 0,
          eyePatternShape: 'rounded',
          gap: 0,
          shape: 'circle'
        }}
        size={QR_CODE_SIZE}
        value={qrCode}
      />
    </Animated.View>
  );
};

type StatusBoxProps = {
  action?: React.ReactNode;
  description: string;
  iconName: 'qrCode' | 'warningFilled';
};

const StatusBox = ({ action, description, iconName }: StatusBoxProps) => (
  <View style={styles.statusBox}>
    <Icon color="grey-700" name={iconName} size={24} />
    <Body style={styles.statusDescription}>{description}</Body>
    {action}
  </View>
);

const styles = StyleSheet.create({
  retryActionContainer: {
    marginTop: 0
  },
  statusBox: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: IOColors['grey-50'],
    borderRadius: 16,
    gap: 8,
    justifyContent: 'center',
    padding: 16
  },
  statusDescription: {
    textAlign: 'center'
  }
});
