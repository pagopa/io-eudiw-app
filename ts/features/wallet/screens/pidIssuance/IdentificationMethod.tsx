import {
  ContentWrapper,
  IOButton,
  ModuleNavigationAlt,
  VSpacer,
  VStack
} from '@pagopa/io-app-design-system';
import {View} from 'react-native';
import I18n from 'i18next';
import {useNavigation} from '@react-navigation/native';
import {IOScrollViewWithLargeHeader} from '../../../../components/IOScrollViewWithLargeHeader';
import {useHeaderSecondLevel} from '../../../../hooks/useHeaderSecondLevel';

export type ItwIdentificationNavigationParams = {
  eidReissuing?: boolean;
  animationEnabled?: boolean;
};

export const IdentificationMethod = () => {
  const navigation = useNavigation();

  useHeaderSecondLevel({
    title: ''
  });

  const handleOnPress = () => {
    navigation.navigate('MAIN_WALLET_NAV', {
      screen: 'PID_ISSUANCE_REQUEST'
    });
  };

  return (
    <IOScrollViewWithLargeHeader
      title={{
        section: I18n.t('identification.modeSelection.section.issuance', {
          ns: 'wallet'
        }),
        label: I18n.t('identification.modeSelection.title.issuance', {
          ns: 'wallet'
        })
      }}
      description={I18n.t('identification.modeSelection.description.issuance', {
        ns: 'wallet'
      })}>
      <ContentWrapper>
        <VSpacer size={8} />
        <VStack space={16}>
          <ModuleNavigationAlt
            title={I18n.t('identification.modeSelection.mode.ciePin.title', {
              ns: 'wallet'
            })}
            subtitle={I18n.t(
              'identification.modeSelection.mode.ciePin.subtitle',
              {ns: 'wallet'}
            )}
            testID="CiePinMethodModuleTestID"
            icon="cieCard"
            onPress={handleOnPress}
            badge={{
              text: I18n.t('identification.modeSelection.mode.ciePin.badge', {
                ns: 'wallet'
              }),
              variant: 'default'
            }}
          />
          <ModuleNavigationAlt
            title={I18n.t('identification.modeSelection.mode.cieId.title', {
              ns: 'wallet'
            })}
            subtitle={I18n.t(
              'identification.modeSelection.mode.cieId.subtitle.default',
              {
                ns: 'wallet'
              }
            )}
            testID="CiePinMethodModuleTestID"
            icon="cie"
            onPress={handleOnPress}
          />
          <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            <IOButton
              variant="link"
              textAlign="center"
              label={I18n.t('identification.modeSelection.noCieCta', {
                ns: 'wallet'
              })}
              onPress={handleOnPress}
              testID={'noCieButtonTestID'}
            />
          </View>
        </VStack>
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};
