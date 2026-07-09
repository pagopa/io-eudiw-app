import { useIOThemeContext } from '@pagopa/io-app-design-system';
import { SvgProps } from 'react-native-svg';
import Logo from '../../assets/img/brand/itw_id_logo.svg';
import LogoDark from '../../assets/img/brand/itw_id_logo_dark.svg';

export const ItWalletIdLogo = (props: SvgProps) => {
  const { themeType } = useIOThemeContext();
  return themeType === 'light' ? <Logo {...props} /> : <LogoDark {...props} />;
};
