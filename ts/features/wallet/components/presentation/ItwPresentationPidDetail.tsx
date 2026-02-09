import { Divider, ListItemHeader } from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Fragment } from 'react/jsx-runtime';
import { t } from 'i18next';
import { MainNavigatorParamsList } from '../../../../navigation/main/MainStackNavigator';
import { parseClaimsToRecord } from '../../utils/claims';
import { WellKnownClaim } from '../../utils/itwClaimsUtils';
import { StoredCredential } from '../../utils/itwTypesUtils';
import { ItwCredentialClaim } from '../credential/ItwCredentialClaim';
import { ItwIssuanceMetadata } from '../ItwIssuanceMetadata';
import { ItwPidLifecycleAlert } from '../ItwPidLifecycleAlert';

type Props = {
  credential: StoredCredential;
};

export const ItwPresentationPidDetail = ({ credential }: Props) => {
  const [claimsHidden, setClaimsHidden] = useState(false);
  const navigation =
    useNavigation<StackNavigationProp<MainNavigatorParamsList>>();

  const listItemHeaderLabel = t('presentation.itWalletId.listItemHeader', {
    ns: 'wallet'
  });

  const claims = useMemo(
    () =>
      Object.entries(
        parseClaimsToRecord(credential.parsedCredential, {
          exclude: [WellKnownClaim.unique_id, WellKnownClaim.content]
        })
      ),
    [credential.parsedCredential]
  );

  const endElement = useMemo<ListItemHeader['endElement']>(
    () => ({
      type: 'iconButton',
      componentProps: {
        icon: claimsHidden ? 'eyeHide' : 'eyeShow',
        accessibilityLabel: listItemHeaderLabel,
        onPress: () => setClaimsHidden(state => !state)
      }
    }),
    [claimsHidden, listItemHeaderLabel]
  );

  return (
    <View>
      <ItwPidLifecycleAlert navigation={navigation} />
      {claims.length > 0 && (
        <ListItemHeader label={listItemHeaderLabel} endElement={endElement} />
      )}
      {claims.map(([id, claim], index) => (
        <Fragment key={id}>
          {index !== 0 && <Divider />}
          <ItwCredentialClaim claim={claim} isPreview hidden={claimsHidden} />
        </Fragment>
      ))}
      {claims.length > 0 && <Divider />}
      <ItwIssuanceMetadata credential={credential} />
    </View>
  );
};
