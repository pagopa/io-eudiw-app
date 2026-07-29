import { getSafeText, isStringNullyOrEmpty } from '@io-eudiw-app/commons';
import {
  BodySmall,
  Divider,
  H6,
  HStack,
  Icon,
  IOColors,
  useIOTheme
} from '@pagopa/io-app-design-system';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { getClaimDisplayValue } from '../../utils/itwClaimsUtils';
import { ClaimDisplayFormat } from '../../utils/itwRemotePresentationUtils';
import { DisclosureClaim } from '../../utils/itwTypesUtils';

type ItwRequiredClaimsListProps = {
  items: readonly DisclosureClaim[];
};

const ItwRequiredClaimsList = ({ items }: ItwRequiredClaimsListProps) => {
  const theme = useIOTheme();
  const backgroundColor = IOColors[theme['appBackground-secondary']];
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {items.map(({ claim, source }, index) => (
        <View key={`${index}-${claim.label}-${source}`}>
          {index !== 0 && <Divider />}
          <HStack
            style={{
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 12
            }}
          >
            <View>
              <ClaimText claim={claim} />
              <BodySmall color={theme['textBody-tertiary']} weight="Regular">
                {t('credentialIssuance.trust.dataSource', {
                  credentialSource: source,
                  ns: 'wallet'
                })}
              </BodySmall>
            </View>
            <Icon
              color={theme['icon-decorative']}
              name="checkTickBig"
              size={24}
            />
          </HStack>
        </View>
      ))}
    </View>
  );
};

const ClaimText = ({ claim }: { claim: ClaimDisplayFormat }) => {
  const displayResult = getClaimDisplayValue(claim);

  const { type, value } = displayResult;

  if (type === 'image') {
    return null;
  }

  if (Array.isArray(value)) {
    return (
      <>
        {value.map((item, index) => {
          const safeValue = getSafeText(item);
          if (isStringNullyOrEmpty(safeValue)) {
            return null;
          }
          return <H6 key={`${index}_${safeValue}`}>{safeValue}</H6>;
        })}
      </>
    );
  }

  const safeText = getSafeText(value);

  if (isStringNullyOrEmpty(safeText)) {
    return null;
  }

  return <H6>{safeText}</H6>;
};

const styles = StyleSheet.create({
  container: {
    borderCurve: 'continuous',
    borderRadius: 8,
    paddingHorizontal: 24
  }
});

export { ItwRequiredClaimsList as ItwRequestedClaimsList };
