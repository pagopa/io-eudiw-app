import {
  IOSkeleton,
  IOVisualCostants,
  useIOTheme
} from '@pagopa/io-app-design-system';
import { Dimensions } from 'react-native';
import QRCode from 'react-native-qrcode-skia';
import Animated, { FadeIn } from 'react-native-reanimated';
import ItwAvatar from '../../../assets/img/brand/itw_avatar.svg';
import { useAppSelector } from '../../store';
import { selectProximityQrCode } from '../../store/proximity';
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
