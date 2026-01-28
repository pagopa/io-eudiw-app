import {
  Divider,
  H6,
  Icon,
  IOColors,
  BodySmall,
  useIOTheme,
  HStack
} from '@pagopa/io-app-design-system';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getClaimDisplayValue } from '../../utils/itwClaimsUtils';
import { ClaimDisplayFormat } from '../../utils/itwRemotePresentationUtils';
import { getSafeText, isStringNullyOrEmpty } from '../../../../utils/string';
import { DisclosureClaim } from '../../utils/itwTypesUtils';

type ItwRequiredClaimsListProps = {
  items: ReadonlyArray<DisclosureClaim>;
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
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 12
            }}
          >
            <View>
              <ClaimText claim={claim} />
              <BodySmall weight="Regular" color={theme['textBody-tertiary']}>
                {t('wallet:credentialIssuance.trust.dataSource', {
                  source
                })}
              </BodySmall>
            </View>
            <Icon
              name="checkTickBig"
              size={24}
              color={theme['icon-decorative']}
            />
          </HStack>
        </View>
      ))}
    </View>
  );
};

const ClaimText = ({ claim }: { claim: ClaimDisplayFormat }) => {
  const displayResult = getClaimDisplayValue(claim);

  const { value, type } = displayResult;

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
    borderRadius: 8,
    borderCurve: 'continuous',
    paddingHorizontal: 24
  }
});

export { ItwRequiredClaimsList as ItwRequestedClaimsList };
