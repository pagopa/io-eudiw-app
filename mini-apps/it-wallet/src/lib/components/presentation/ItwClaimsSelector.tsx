import { getSafeText } from '@io-eudiw-app/commons';
import {
  Divider,
  Icon,
  IOAccordionRadius,
  ListItemCheckbox,
  ListItemInfo
} from '@pagopa/io-app-design-system';
import { Fragment, useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { useAccordionAnimation } from '../../hooks/useAccordionAnimation';
import { getClaimDisplayValue } from '../../utils/itwClaimsUtils';
import { getCredentialNameFromType } from '../../utils/itwCredentialUtils';
import { ClaimDisplayFormat } from '../../utils/itwRemotePresentationUtils';
import { useCredentialCardConfig } from '../credential/ItwCredentialCard/config';
import { ItwCredentialClaimsCard } from '../credential/ItwCredentialClaimsCard';

// Threshold to determine when the accordion is considered fully collapsed
const COLLAPSED_RADIUS_THRESHOLD = 0.001;

// Border width offset to ensure gradient fits within the border curves
const COLLAPSIBLE_BORDER = 1;

type ItwClaimsSelectorProps = {
  /** Credential type, used for the title and the header colors. */
  credentialType: string;
  /** Whether the accordion starts expanded. */
  defaultExpanded?: boolean;
  /** The claims to display within the accordion. */
  items: ClaimDisplayFormat[];
  /** Called when an item is selected, when selection is enabled. */
  onItemSelected?: (item: ClaimDisplayFormat, selected: boolean) => void;
  /** Called when the accordion is expanded or collapsed. */
  onToggle?: (expanded: boolean) => void;
  /** The IDs of the selected items, when the component is controlled. */
  selectedItemIds?: string[];
  /** Enables the selection of items with a checkbox. */
  selectionEnabled?: boolean;
};

const ClaimItem = ({
  isSelected,
  item,
  onItemSelected,
  selectionEnabled
}: {
  isSelected?: boolean;
  item: ClaimDisplayFormat;
  onItemSelected?: (item: ClaimDisplayFormat, selected: boolean) => void;
  selectionEnabled: boolean;
}) => {
  const display = getClaimDisplayValue(item);

  if (display.type === 'image') {
    return (
      <ListItemInfo
        accessibilityRole="image"
        label={item.label}
        reversed
        value={
          <Image
            accessibilityIgnoresInvertColors
            resizeMode="contain"
            source={{ uri: display.value }}
            style={styles.imageClaim}
          />
        }
      />
    );
  }

  const value = Array.isArray(display.value)
    ? display.value.map(v => getSafeText(v)).join(', ')
    : getSafeText(display.value, 1024);

  return selectionEnabled ? (
    <ListItemCheckbox
      description={item.label}
      onValueChange={
        onItemSelected ? selected => onItemSelected(item, selected) : undefined
      }
      selected={isSelected}
      value={value}
    />
  ) : (
    <ListItemInfo label={item.label} reversed value={value} />
  );
};

/**
 * Collapsible card listing the claims of a credential, with an optional
 * checkbox selection.
 */
export const ItwClaimsSelector = ({
  credentialType,
  defaultExpanded,
  items,
  onItemSelected,
  onToggle,
  selectedItemIds,
  selectionEnabled = false
}: ItwClaimsSelectorProps) => {
  const {
    bodyAnimatedStyle,
    bodyInnerStyle,
    expanded,
    iconAnimatedStyle,
    onBodyLayout,
    progress,
    toggleAccordion
  } = useAccordionAnimation({ defaultExpanded });

  const { background } = useCredentialCardConfig(credentialType);
  const title = getCredentialNameFromType(credentialType);

  // Deduplicate by id so React keys are unique
  const uniqueItems = useMemo(
    () =>
      items.filter(
        (claim, index, all) =>
          all.findIndex(({ id }) => id === claim.id) === index
      ),
    [items]
  );

  const headerRadiusAnimatedStyle = useAnimatedStyle(() => {
    // Bottom corners are rounded only when fully collapsed
    const bottomRadius =
      progress.value < COLLAPSED_RADIUS_THRESHOLD ? IOAccordionRadius : 0;
    return {
      borderBottomLeftRadius: bottomRadius - COLLAPSIBLE_BORDER,
      borderBottomRightRadius: bottomRadius - COLLAPSIBLE_BORDER,
      borderTopLeftRadius: IOAccordionRadius - COLLAPSIBLE_BORDER,
      borderTopRightRadius: IOAccordionRadius - COLLAPSIBLE_BORDER,
      overflow: 'hidden'
    };
  });

  return (
    <ItwCredentialClaimsCard
      gradientEndColor={background.colors[0]}
      headerAccessibilityState={{ expanded }}
      headerAccessory={
        <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
          <Icon name="chevronBottom" />
        </Animated.View>
      }
      headerStyle={headerRadiusAnimatedStyle}
      onHeaderPress={() => {
        toggleAccordion();
        onToggle?.(!expanded);
      }}
      title={title}
    >
      <Animated.View style={bodyAnimatedStyle}>
        <View
          onLayout={onBodyLayout}
          style={[bodyInnerStyle, styles.bodyInnerContainer]}
        >
          {uniqueItems.map((item, index) => (
            <Fragment key={item.id}>
              {index !== 0 && <Divider />}
              <ClaimItem
                isSelected={selectedItemIds?.includes(item.id)}
                item={item}
                onItemSelected={onItemSelected}
                selectionEnabled={selectionEnabled}
              />
            </Fragment>
          ))}
        </View>
      </Animated.View>
    </ItwCredentialClaimsCard>
  );
};

const styles = StyleSheet.create({
  bodyInnerContainer: {
    width: '100%'
  },
  iconContainer: {
    marginLeft: 16
  },
  imageClaim: {
    borderRadius: 8,
    height: 200,
    width: 150
  }
});
