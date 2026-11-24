import { H3, IOButton, VSpacer } from '@pagopa/io-app-design-system';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  TextInput as RNTextInput,
  StyleSheet,
  View
} from 'react-native';

import { subscribeToPinRequests } from '../utils/pinPrompt';

type Request = Parameters<Parameters<typeof subscribeToPinRequests>[0]>[0];

/**
 * Modal which asks the user for the Remote WSCD PIN whenever {@link requestRemotePin} is called.
 */
export const RemotePinPrompt = () => {
  const { t } = useTranslation('hsm');
  const [request, setRequest] = useState<Request>();
  const [pin, setPin] = useState('');

  useEffect(() => subscribeToPinRequests(setRequest), []);

  const close = () => {
    setRequest(undefined);
    setPin('');
  };

  const cancel = () => {
    request?.reject(new Error('PIN entry cancelled'));
    close();
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={cancel}
      transparent
      visible={!!request}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <H3>{request?.title}</H3>
          <VSpacer size={8} />
          <RNTextInput
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            onChangeText={setPin}
            placeholder={t('remoteWscd.pin.placeholder')}
            secureTextEntry
            style={styles.input}
            value={pin}
          />
          <VSpacer size={8} />
          <IOButton
            disabled={!pin}
            label={t('remoteWscd.pin.confirm')}
            onPress={() => {
              request?.resolve(pin);
              close();
            }}
            variant="solid"
          />
          <VSpacer size={8} />
          <IOButton
            label={t('remoteWscd.pin.cancel')}
            onPress={cancel}
            variant="outline"
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    justifyContent: 'center',
    padding: 24
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '100%'
  },
  input: {
    borderColor: '#0E0F13',
    borderRadius: 8,
    borderWidth: 2,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 12
  }
});
