import {
  ContentWrapper,
  IOButton,
  ModuleNavigationAlt,
  VSpacer,
  VStack
} from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { t } from 'i18next';
import { View } from 'react-native';
import { IOScrollViewWithLargeHeader } from '../../../../components/IOScrollViewWithLargeHeader';
import { useHeaderSecondLevel } from '../../../../hooks/useHeaderSecondLevel';

export type ItwIdentificationNavigationParams = {
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
        section: t('identification.modeSelection.section.issuance', {
          ns: 'wallet'
        }),
        label: t('identification.modeSelection.title.issuance', {
          ns: 'wallet'
        })
      }}
      description={t('identification.modeSelection.description.issuance', {
        ns: 'wallet'
      })}
    >
      <ContentWrapper>
        <VSpacer size={8} />
        <VStack space={16}>
          <ModuleNavigationAlt
            title={t('identification.modeSelection.mode.ciePin.title', {
              ns: 'wallet'
            })}
            subtitle={t('identification.modeSelection.mode.ciePin.subtitle', {
              ns: 'wallet'
            })}
            testID="CiePinMethodModuleTestID"
            icon="cieCard"
            onPress={handleOnPress}
            badge={{
              text: t('identification.modeSelection.mode.ciePin.badge', {
                ns: 'wallet'
              }),
              variant: 'highlight'
            }}
          />
          <ModuleNavigationAlt
            title={t('identification.modeSelection.mode.spid.title', {
              ns: 'wallet'
            })}
            subtitle={t('identification.modeSelection.mode.spid.subtitle', {
              ns: 'wallet'
            })}
            testID="SpidMethodModuleTestID"
            icon="spid"
            onPress={handleOnPress}
          />
          <ModuleNavigationAlt
            title={t('identification.modeSelection.mode.cieId.title', {
              ns: 'wallet'
            })}
            subtitle={t('identification.modeSelection.mode.cieId.subtitle', {
              ns: 'wallet'
            })}
            testID="CiePinMethodModuleTestID"
            icon="cie"
            onPress={handleOnPress}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <IOButton
              variant="link"
              textAlign="center"
              label={t('identification.modeSelection.noCieCta', {
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
