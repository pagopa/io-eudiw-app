import { IdentificationModal } from '@io-eudiw-app/identification';

import { useTranslation } from 'react-i18next';

/**
 * A component that renders a scrollable view with a list of `ListItemInfo`
 * @param title - The title of the list
 * @param subtitle - The subtitle of the list, which can be a string or an array of `BodyProps`
 * @param renderItems - The array of `ListItemInfo` to be rendered in the list
 * @param listItemHeaderLabel - The label for the list item header
 * @param actions - The actions for the IOScrollView component
 * @param isHeaderVisible- A flag indicating whether the header is visible or not
 */
export const IdentificationModalWrapper = () => {
  const { t } = useTranslation(['common', 'global']);

  return (
    <IdentificationModal
      titleLabels={{
        validation: t('global:identification.title.validation'),
        access: t('global:identification.title.access')
      }}
      biometricLabels={{
        promptMessage: t('global:identification.biometric.title'),
        promptDescription: t(
          'global:identification.biometric.sensorDescription'
        ),
        cancelLabel: t('common:buttons.cancel')
      }}
      instructionsLabels={{
        unlockCode: t('global:identification.instructions.useUnlockCode'),
        fingerprint: t(
          'global:identification.instructions.useFingerPrintOrUnlockCode'
        ),
        faceId: t('global:identification.instructions.useFaceIdOrUnlockCode')
      }}
      resetLabels={{
        forgotButton: t('global:identification.forgot.title'),
        title: t('global:identification.forgot.title'),
        confirmMsg: t('global:identification.forgot.confirmMsg'),
        confirmMsgWithTask: t(
          'global:identification.forgot.confirmMsgWithTask'
        ),
        confirmButton: t('common:buttons.confirm'),
        cancelButton: t('common:buttons.cancel')
      }}
      closeAccessibilityLabel={t('common:buttons.close')}
      deleteAccessibilityLabel={t('common:buttons.delete')}
      fingerprintAccessibilityLabel={t(
        'global:identification.unlockCode.accessibility.fingerprint'
      )}
      faceAccessibilityLabel={t(
        'global:identification.unlockCode.accessibility.faceId'
      )}
    />
  );
};
