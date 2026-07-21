import {
  Body,
  ListItemHeader,
  ListItemInfo,
  VStack
} from '@pagopa/io-app-design-system';
import { Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  itwProximityConsentsEntriesSelector,
  itwRevokeProximityConsentByKey
} from '../../store/proximityConsents';
import { IOScrollView, useHeaderSecondLevel } from '@io-eudiw-app/commons';
import I18n from 'i18next';

export const ProximityConsents = () => {
  const dispatch = useAppDispatch();
  const consents = useAppSelector(itwProximityConsentsEntriesSelector);

  useHeaderSecondLevel({
    title: ''
  });

  const handleRevokeConsent = (key: string) => {
    dispatch(itwRevokeProximityConsentByKey(key));
  };

  return (
    <IOScrollView>
      <ListItemHeader
        label={I18n.t('settings.proximity.screen.title', { ns: 'wallet' })}
      />
      {consents.length === 0 ? (
        <Body>
          {I18n.t('settings.proximity.screen.empty', { ns: 'wallet' })}
        </Body>
      ) : (
        <VStack space={8}>
          {consents.map(([key, consent]) => (
            <ListItemInfo
              key={key}
              label={consent.rpId}
              value={key}
              numberOfLines={1}
              endElement={{
                type: 'iconButton',
                componentProps: {
                  icon: 'trashcan',
                  onPress: () => handleRevokeConsent(key),
                  accessibilityLabel: I18n.t(
                    'settings.proximity.screen.delete',
                    { ns: 'wallet', rpId: consent.rpId }
                  )
                }
              }}
              onLongPress={() =>
                Alert.alert(consent.rpId, JSON.stringify(consent))
              }
            />
          ))}
        </VStack>
      )}
    </IOScrollView>
  );
};
