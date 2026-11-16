import {
  IOScrollViewWithLargeHeader,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
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
      description={t('identification.modeSelection.description.issuance', {
        ns: 'aptitude'
      })}
      title={{
        label: t('identification.modeSelection.title.issuance', {
          ns: 'aptitude'
        }),
        section: t('identification.modeSelection.section.issuance', {
          ns: 'aptitude'
        })
      }}
    >
      <ContentWrapper>
        <VSpacer size={8} />
        <VStack space={16}>
          <ModuleNavigationAlt
            badge={{
              text: t('identification.modeSelection.mode.ciePin.badge', {
                ns: 'aptitude'
              }),
              variant: 'highlight'
            }}
            icon="cieCard"
            onPress={handleOnPress}
            subtitle={t('identification.modeSelection.mode.ciePin.subtitle', {
              ns: 'aptitude'
            })}
            testID="CiePinMethodModuleTestID"
            title={t('identification.modeSelection.mode.ciePin.title', {
              ns: 'aptitude'
            })}
          />
          <ModuleNavigationAlt
            icon="spid"
            onPress={handleOnPress}
            subtitle={t('identification.modeSelection.mode.spid.subtitle', {
              ns: 'aptitude'
            })}
            testID="SpidMethodModuleTestID"
            title={t('identification.modeSelection.mode.spid.title', {
              ns: 'aptitude'
            })}
          />
          <ModuleNavigationAlt
            icon="cie"
            onPress={handleOnPress}
            subtitle={t('identification.modeSelection.mode.cieId.subtitle', {
              ns: 'aptitude'
            })}
            testID="CiePinMethodModuleTestID"
            title={t('identification.modeSelection.mode.cieId.title', {
              ns: 'aptitude'
            })}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <IOButton
              label={t('identification.modeSelection.noCieCta', {
                ns: 'aptitude'
              })}
              onPress={handleOnPress}
              testID={'noCieButtonTestID'}
              textAlign="center"
              variant="link"
            />
          </View>
        </VStack>
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};
