import {
  IOScrollView,
  OperationResultScreenContent,
  useHeaderSecondLevel
} from '@io-eudiw-app/commons';
import { useDebugInfo } from '@io-eudiw-app/debug-info';
import { VStack } from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import ItwCredentialNotFound from '../../components/ItwCredentialNotFound';
import { ItwPresentationClaimsSection } from '../../components/presentation/ItwPresentationClaimsSection';
import { ItwPresentationCredentialUnknownStatus } from '../../components/presentation/ItwPresentationCredentialUnknownStatus';
import { WalletNavigatorParamsList } from '../../navigation/wallet/WalletNavigator';
import { useAppSelector } from '../../store';
import { selectCredential } from '../../store/credentials';
import { lifecycleIsValidSelector } from '../../store/lifecycle';
import { parseClaimsToRecord } from '../../utils/claims';
import { getCredentialStatus } from '../../utils/itwCredentialStatusUtils';
import { StoredCredentialMetadata } from '../../utils/itwTypesUtils';

export type ItwPresentationCredentialDetailNavigationParams = {
  credentialType: string;
};

type Props = StackScreenProps<
  WalletNavigatorParamsList,
  'PRESENTATION_CREDENTIAL_DETAILS'
>;

/**
 * Component that renders the credential detail screen.
 */
export const ItwPresentationCredentialDetailScreen = ({ route }: Props) => {
  const navigation =
    useNavigation<StackNavigationProp<WalletNavigatorParamsList>>();
  const { credentialType } = route.params;
  const { t } = useTranslation(['itWalletHsm', 'common']);

  const credential = useAppSelector(selectCredential(credentialType));

  const isWalletValid = useAppSelector(lifecycleIsValidSelector);

  if (!isWalletValid) {
    const ns = 'issuance.walletInstanceNotActive';

    return (
      <OperationResultScreenContent
        action={{
          label: t(`${ns}.primaryAction`),
          onPress: () => navigation.replace('CREDENTIAL_ISSUANCE_LIST')
        }}
        pictogram="itWallet"
        secondaryAction={{
          label: t(`${ns}.secondaryAction`),
          onPress: () => navigation.popToTop()
        }}
        subtitle={[
          { text: t(`${ns}.itWallet.body`) },
          {
            text: t(`${ns}.itWallet.bodyBold`),
            weight: 'Semibold'
          }
        ]}
        title={t(`${ns}.itWallet.title`)}
      />
    );
  }

  if (!credential) {
    // If the credential is not found, we render a screen that allows the user to request that credential.
    return (
      <ItwCredentialNotFound
        cancelButtonLabel={t('common:buttons.cancel')}
        continueButtonLabel={t('common:buttons.continue')}
        credentialType={credentialType}
      />
    );
  }
  return <ItwPresentationCredentialDetail credential={credential} />;
};

type ItwPresentationCredentialDetailProps = {
  credential: StoredCredentialMetadata;
};

/**
 * Component that renders the credential detail content.
 */
const ItwPresentationCredentialDetail = ({
  credential
}: ItwPresentationCredentialDetailProps) => {
  const status = getCredentialStatus(credential);

  useHeaderSecondLevel({
    canGoBack: true,
    title: ''
  });
  useDebugInfo(credential);

  const parsedClaims = useMemo(
    () => parseClaimsToRecord(credential.parsedCredential),
    [credential.parsedCredential]
  );

  if (status === 'unknown') {
    return <ItwPresentationCredentialUnknownStatus credential={credential} />;
  }

  return (
    <IOScrollView>
      <VStack space={24}>
        <ItwPresentationClaimsSection
          credential={credential}
          parsedClaims={parsedClaims}
        />
      </VStack>
    </IOScrollView>
  );
};
