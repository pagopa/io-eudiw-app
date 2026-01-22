import { Divider, ListItemHeader } from '@pagopa/io-app-design-system';
import { View } from 'react-native';
import { Fragment } from 'react/jsx-runtime';
import { useMemo, useState } from 'react';
import I18n from 'i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { WellKnownClaim } from '../../utils/itwClaimsUtils';
import { ItwCredentialClaim } from '../credential/ItwCredentialClaim';
import { MainNavigatorParamsList } from '../../../../navigation/main/MainStackNavigator';
import { ItwPidLifecycleAlert } from '../ItwPidLifecycleAlert';
import { ItwIssuanceMetadata } from '../ItwIssuanceMetadata';
import { StoredCredential } from '../../utils/itwTypesUtils';
import { parseClaimsToRecord } from '../../utils/claims';

type Props = {
  credential: StoredCredential;
};

export const ItwPresentationPidDetail = ({ credential }: Props) => {
  const [claimsHidden, setClaimsHidden] = useState(false);
  const navigation =
    useNavigation<StackNavigationProp<MainNavigatorParamsList>>();

  const listItemHeaderLabel = I18n.t('presentation.itWalletId.listItemHeader', {
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
