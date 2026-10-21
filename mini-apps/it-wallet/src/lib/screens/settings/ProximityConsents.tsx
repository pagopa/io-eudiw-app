import { IOScrollView, useHeaderSecondLevel } from '@io-eudiw-app/commons';
import {
  Body,
  ListItemHeader,
  ListItemInfo,
  VStack
} from '@pagopa/io-app-design-system';
import I18n from 'i18next';
import { Alert } from 'react-native';

import { useAppDispatch, useAppSelector } from '../../store';
import {
  itwProximityConsentsEntriesSelector,
  itwRevokeProximityConsentByKey
} from '../../store/proximityConsents';

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
              endElement={{
                componentProps: {
                  accessibilityLabel: I18n.t(
                    'settings.proximity.screen.delete',
                    { ns: 'wallet', rpId: consent.rpId }
                  ),
                  icon: 'trashcan',
                  onPress: () => handleRevokeConsent(key)
                },
                type: 'iconButton'
              }}
              key={key}
              label={consent.rpId}
              numberOfLines={1}
              onLongPress={() =>
                Alert.alert(consent.rpId, JSON.stringify(consent))
              }
              value={key}
            />
          ))}
        </VStack>
      )}
    </IOScrollView>
  );
};
