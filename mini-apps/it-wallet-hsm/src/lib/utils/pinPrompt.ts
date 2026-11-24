import { t } from 'i18next';

type PinRequest = {
  reject: (reason: Error) => void;
  resolve: (pin: string) => void;
  title: string;
};

const listeners = new Set<(request: PinRequest) => void>();

/**
 * Asks the user for the Remote WSCD PIN through the {@link RemotePinPrompt} mounted in the mini-app.
 * The PIN is never stored: it must be requested whenever it is needed.
 * @param title - The title of the prompt
 * @returns The PIN entered by the user
 * @throws If the user dismisses the prompt or no prompt is mounted
 */
export const requestRemotePin = (
  title = t('remoteWscd.pin.title', { ns: 'hsm' })
): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    if (listeners.size === 0) {
      reject(new Error('No PIN prompt is available'));
      return;
    }
    listeners.forEach(listener => listener({ reject, resolve, title }));
  });

/**
 * Subscribes to the PIN requests, to show the prompt.
 * @returns The function to unsubscribe
 */
export const subscribeToPinRequests = (
  listener: (request: PinRequest) => void
) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
