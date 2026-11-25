import {
  IOScrollViewWithLargeHeader,
  useHeaderSecondLevel,
  useIOBottomSheetModal
} from '@io-eudiw-app/commons';
import {
  Body,
  ContentWrapper,
  FooterActions,
  HStack,
  Icon,
  IOIcons,
  ModuleNavigationAlt,
  useIOTheme,
  VSpacer,
  VStack
} from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

export const IdentificationMethod = () => {
  const navigation = useNavigation();
  const { t } = useTranslation(['hsm', 'common']);
  const theme = useIOTheme();

  useHeaderSecondLevel({
    title: ''
  });

  const cieIdBottomSheet = useIOBottomSheetModal({
    closeAccessibilityLabel: t('common:buttons.close'),
    component: (
      <>
        <VStack space={24}>
          <Body color={theme['textBody-tertiary']}>
            {t(
              'identification.modeSelection.mode.cieId.bottomSheet.requirements'
            )}
          </Body>
          <RequirementRow
            icon="fiscalCodeIndividual"
            label={t('identification.modeSelection.mode.cieId.bottomSheet.cie')}
          />
          <RequirementRow
            icon="cie"
            label={t('identification.modeSelection.mode.cieId.bottomSheet.app')}
          />
        </VStack>
        <VSpacer size={24} />
      </>
    ),
    footer: (
      <FooterActions
        actions={{
          primary: {
            label: t(
              'identification.modeSelection.mode.cieId.bottomSheet.primaryAction'
            ),
            onPress: () => {
              cieIdBottomSheet.dismiss();
              navigation.navigate('MAIN_WALLET_NAV', {
                screen: 'PID_ISSUANCE_REQUEST'
              });
            }
          },
          type: 'SingleButton'
        }}
      />
    ),
    title: t('identification.modeSelection.mode.cieId.bottomSheet.title')
  });

  return (
    <IOScrollViewWithLargeHeader
      description={t('identification.modeSelection.description.issuance')}
      title={{
        label: t('identification.modeSelection.title.issuance'),
        section: t('identification.modeSelection.section.issuance')
      }}
    >
      <ContentWrapper>
        <VSpacer size={8} />
        <ModuleNavigationAlt
          icon="cie"
          onPress={cieIdBottomSheet.present}
          subtitle={t('identification.modeSelection.mode.cieId.subtitle')}
          testID="CieIdMethodModuleTestID"
          title={t('identification.modeSelection.mode.cieId.title')}
        />
      </ContentWrapper>
      {cieIdBottomSheet.bottomSheet}
    </IOScrollViewWithLargeHeader>
  );
};

const RequirementRow = ({ icon, label }: { icon: IOIcons; label: string }) => {
  const theme = useIOTheme();
  return (
    <HStack space={24} style={styles.requirement}>
      <View style={styles.requirementIcon}>
        <Icon color={theme['icon-decorative']} name={icon} size={32} />
      </View>
      <Body color={theme['textBody-tertiary']} style={styles.requirementLabel}>
        {label}
      </Body>
    </HStack>
  );
};

const styles = StyleSheet.create({
  requirement: {
    alignItems: 'center'
  },
  requirementIcon: {
    alignItems: 'center',
    width: 48
  },
  requirementLabel: {
    flex: 1
  }
});
