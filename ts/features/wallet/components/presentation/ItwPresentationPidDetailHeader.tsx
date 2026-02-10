import {
  Body,
  ContentWrapper,
  IOAppMargin,
  VStack
} from '@pagopa/io-app-design-system';
import { StyleSheet, View } from 'react-native';
import { t } from 'i18next';
import FocusAwareStatusBar from '../../../../components/FocusAwareStatusBar';
import { getLuminance } from '../../../../utils/color';
import ITWalletIDImage from '../../assets/img/brand/itw_id_logo.svg';
import { useItWalletTheme } from '../../utils/theme';

export const ItwPresentationPidDetailHeader = () => {
  const theme = useItWalletTheme();

  return (
    <>
      <FocusAwareStatusBar
        backgroundColor={theme['header-background']}
        barStyle={
          getLuminance(theme['header-background']) < 0.5
            ? 'light-content'
            : 'dark-content'
        }
      />
      <View
        style={[
          styles.scrollHack,
          { backgroundColor: theme['header-background'] }
        ]}
      >
        <ContentWrapper>
          <VStack space={8} style={styles.content}>
            <ITWalletIDImage width={140} height={34} />
            <Body>
              {t('presentation.itWalletId.description', { ns: 'wallet' })}
            </Body>
          </VStack>
        </ContentWrapper>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingVertical: IOAppMargin[1]
  },
  /** Hack to remove the white band when scrolling on iOS devices  */
  scrollHack: {
    paddingTop: 300,
    marginTop: -300
  }
});
