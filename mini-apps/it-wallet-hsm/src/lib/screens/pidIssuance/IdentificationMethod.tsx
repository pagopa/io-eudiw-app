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
        ns: 'hsm'
      })}
      title={{
        label: t('identification.modeSelection.title.issuance', {
          ns: 'hsm'
        }),
        section: t('identification.modeSelection.section.issuance', {
          ns: 'hsm'
        })
      }}
    >
      <ContentWrapper>
        <VSpacer size={8} />
        <VStack space={16}>
          <ModuleNavigationAlt
            icon="cieCard"
            onPress={handleOnPress}
            subtitle={t('identification.modeSelection.mode.ciePin.subtitle', {
              ns: 'hsm'
            })}
            testID="CiePinMethodModuleTestID"
            title={t('identification.modeSelection.mode.ciePin.title', {
              ns: 'hsm'
            })}
          />
          <ModuleNavigationAlt
            icon="cie"
            onPress={handleOnPress}
            subtitle={t('identification.modeSelection.mode.cieId.subtitle', {
              ns: 'hsm'
            })}
            testID="CiePinMethodModuleTestID"
            title={t('identification.modeSelection.mode.cieId.title', {
              ns: 'hsm'
            })}
          />
          <ModuleNavigationAlt
            icon="spid"
            onPress={handleOnPress}
            subtitle={t('identification.modeSelection.mode.spid.subtitle', {
              ns: 'hsm'
            })}
            testID="SpidMethodModuleTestID"
            title={t('identification.modeSelection.mode.spid.title', {
              ns: 'hsm'
            })}
          />
          <IOButton
            label={t('identification.modeSelection.noCieCta', {
              ns: 'hsm'
            })}
            onPress={handleOnPress}
            testID={'noCieButtonTestID'}
            variant="link"
          />
        </VStack>
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};
