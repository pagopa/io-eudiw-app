import { useNavigation } from '@react-navigation/native';

/**
 * Hook which exposes a method to confirm the identity again, which obtains a new PID and a new IT-Wallet password.
 * It is used when the user forgot the password or the PID is locked by too many wrong passwords.
 */
export const useStartIdentityRecovery = () => {
  const navigation = useNavigation();

  const startIdentityRecovery = () =>
    navigation.reset({
      index: 1,
      routes: [
        { name: 'MAIN_TAB_NAV' },
        {
          name: 'MAIN_WALLET_NAV',
          params: {
            params: { isRecovering: true },
            screen: 'PID_ISSUANCE_ID_METHOD'
          }
        }
      ]
    });

  return { startIdentityRecovery };
};
