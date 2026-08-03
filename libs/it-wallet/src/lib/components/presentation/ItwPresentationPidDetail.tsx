import { Divider, ListItemHeader } from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Fragment } from 'react/jsx-runtime';

import { MainNavigatorParamsList } from '../../navigation/main/MainStackNavigator';
import { parseClaimsToRecord } from '../../utils/claims';
import { WellKnownClaim } from '../../utils/itwClaimsUtils';
import { StoredCredentialMetadata } from '../../utils/itwTypesUtils';
import { ItwCredentialClaim } from '../credential/ItwCredentialClaim';
import { ItwIssuanceMetadata } from '../ItwIssuanceMetadata';
import { ItwPidLifecycleAlert } from '../ItwPidLifecycleAlert';

type Props = {
  credential: StoredCredentialMetadata;
};

export const ItwPresentationPidDetail = ({ credential }: Props) => {
  const [claimsHidden, setClaimsHidden] = useState(false);
  const navigation =
    useNavigation<StackNavigationProp<MainNavigatorParamsList>>();
  const { t } = useTranslation(['common', 'wallet']);
  const listItemHeaderLabel = t(
    'wallet:presentation.itWalletId.listItemHeader'
  );

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
      componentProps: {
        accessibilityLabel: listItemHeaderLabel,
        icon: claimsHidden ? 'eyeHide' : 'eyeShow',
        onPress: () => setClaimsHidden(state => !state)
      },
      type: 'iconButton'
    }),
    [claimsHidden, listItemHeaderLabel]
  );

  return (
    <View>
      <ItwPidLifecycleAlert
        lifecycleStatus={['jwtExpired', 'jwtExpiring']}
        navigation={navigation}
      />
      {claims.length > 0 && (
        <ListItemHeader endElement={endElement} label={listItemHeaderLabel} />
      )}
      {claims.map(([id, claim], index) => (
        <Fragment key={id}>
          {index !== 0 && <Divider />}
          <ItwCredentialClaim
            claim={claim}
            clipboardSuccessMessage={t('common:clipboard.copyFeedback')}
            hidden={claimsHidden}
            isPreview
            showLabel={t('common:buttons.show')}
          />
        </Fragment>
      ))}
      {claims.length > 0 && <Divider />}
      <ItwIssuanceMetadata credential={credential} />
    </View>
  );
};
