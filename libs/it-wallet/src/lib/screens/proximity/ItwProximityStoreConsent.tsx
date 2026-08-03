import {
  OperationResultScreenContent,
  useDisableGestureNavigation,
  useHardwareBackButton
} from '@io-eudiw-app/commons';
import { useDebugInfo } from '@io-eudiw-app/debug-info';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import MAIN_ROUTES from '../../navigation/main/routes';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  ProximityStatus,
  selectProximityStatus,
  setProximityStoreConsentChosen
} from '../../store/proximity';

/**
 * Store-consent screen shown during the NFC-retrieval dance, after the user has
 * reviewed the requested claims and while the native session is torn down. It
 * asks whether to persist the consent so future contactless verifications for
 * the same relying party and claims skip the claims disclosure step.
 *
 * The choice is signalled to the proximity middleware, which then runs the
 * identification step and re-engages the native session. Navigation reacts to
 * the resulting proximity status: `STARTED` (re-engagement) returns to the NFC
 * presentment screen, a failure status routes to the failure screen.
 */
const ItwProximityStoreConsent = () => {
  const { t } = useTranslation(['wallet']);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const proximityStatus = useAppSelector(selectProximityStatus);

  useDebugInfo({ proximityStatusStoreConsent: proximityStatus });

  useHardwareBackButton(() => true);
  useDisableGestureNavigation();

  useEffect(() => {
    if (proximityStatus === ProximityStatus.PROXIMITY_STATUS_STARTED) {
      // Re-engagement: return to the NFC presentment screen so the user can tap
      // again and the verifier re-issues the request.
      navigation.navigate(MAIN_ROUTES.NFC_PRESENTMENT);
    } else if (
      proximityStatus === ProximityStatus.PROXIMITY_STATUS_ERROR ||
      proximityStatus === ProximityStatus.PROXIMITY_STATUS_ABORTED
    ) {
      navigation.navigate('MAIN_WALLET_NAV', {
        params: { fatal: true },
        screen: 'PROXIMITY_FAILURE'
      });
    }
  }, [proximityStatus, navigation]);

  const choose = (store: boolean) => () =>
    dispatch(setProximityStoreConsentChosen({ store }));

  return (
    <OperationResultScreenContent
      action={{
        accessibilityLabel: t('wallet:proximity.storeConsent.action'),
        label: t('wallet:proximity.storeConsent.action'),
        onPress: choose(true)
      }}
      pictogram="activate"
      secondaryAction={{
        accessibilityLabel: t('wallet:proximity.storeConsent.secondaryAction'),
        label: t('wallet:proximity.storeConsent.secondaryAction'),
        onPress: choose(false)
      }}
      subtitle={t('wallet:proximity.storeConsent.subtitle')}
      title={t('wallet:proximity.storeConsent.title')}
    />
  );
};

export default ItwProximityStoreConsent;
