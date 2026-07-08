import {
  Body,
  Icon,
  IOButton,
  IOColors,
  IOSkeleton,
  IOVisualCostants,
  useIOTheme
} from '@pagopa/io-app-design-system';
import { Dimensions, StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-skia';
import Animated, { FadeIn } from 'react-native-reanimated';
import ItwAvatar from '../../../assets/img/brand/itw_avatar.svg';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  resetProximity,
  selectProximityFailure,
  selectProximityQrCode,
  setProximityEngagementMode,
  setProximityStatusStarted,
  setProximityStatusStopped
} from '../../store/proximity';
import { ITW_BRANDED_BOX_PADDING } from '../ItwBrandedBox';
import I18n from 'i18next';
import { useCallback } from 'react';
import { useProximityEngagement } from '../../hooks/useProximityEngagement';

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

  const handleRetry = useCallback(async () => {
    dispatch(setProximityStatusStopped());
    dispatch(resetProximity());
    dispatch(setProximityEngagementMode('qrcode'));
    dispatch(setProximityStatusStarted());
    await startQrVerification();
  }, [dispatch, startQrVerification]);

  if (proximityFailure) {
    return (
      <StatusBox
        iconName="warningFilled"
        description={I18n.t('proximity.engagement.qrCode.error', {
          ns: 'wallet'
        })}
        action={
          <View style={styles.retryActionContainer}>
            <IOButton
              variant="link"
              label={I18n.t('buttons.retry', { ns: 'common' })}
              onPress={handleRetry}
            />
          </View>
        }
      />
    );
  }

  if (!qrCode) {
    return <IOSkeleton shape="square" size={QR_CODE_SIZE} radius={16} />;
  }

  return (
    <Animated.View entering={FadeIn.duration(200)}>
      <QRCode
        color={theme['textBody-default']}
        value={qrCode}
        size={QR_CODE_SIZE}
        errorCorrectionLevel="H"
        shapeOptions={{
          shape: 'circle',
          eyePatternShape: 'rounded',
          eyePatternGap: 0,
          gap: 0
        }}
        logoAreaSize={88}
        logoAreaBorderRadius={8}
        logo={
          <ItwAvatar width={QR_CODE_LOGO_SIZE} height={QR_CODE_LOGO_SIZE} />
        }
      />
    </Animated.View>
  );
};

type StatusBoxProps = {
  iconName: 'warningFilled' | 'qrCode';
  description: string;
  action?: React.ReactNode;
};

const StatusBox = ({ iconName, description, action }: StatusBoxProps) => (
  <View style={styles.statusBox}>
    <Icon name={iconName} size={24} color="grey-700" />
    <Body style={styles.statusDescription}>{description}</Body>
    {action}
  </View>
);

const styles = StyleSheet.create({
  statusBox: {
    backgroundColor: IOColors['grey-50'],
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
    padding: 16,
    borderRadius: 16,
    gap: 8
  },
  statusDescription: {
    textAlign: 'center'
  },
  retryActionContainer: {
    marginTop: 0
  }
});
