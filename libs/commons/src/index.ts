import { default as jsonLocale } from './lib/locales/it/common.json';
import { Resource } from 'i18next';
export * from './lib/hooks/useHeaderSecondLevel';
export * from './lib/hooks/useDisableGestureNavigation';
export * from './lib/hooks/useHardwareBackButton';
export * from './lib/components/OperationalResultScreenContext';
export * from './lib/utils/string';
export * from './lib/types/utils';
export * from './lib/hooks/useBottomSheet';
export * from './lib/utils/brightness';
export * from './lib/utils/device';
export * from './lib/utils/url';
export * from './lib/components/IOMarkdown';
export * from './lib/components/IOMarkdown/renderRules';
export * from './lib/components/IOMarkdown/types';
export * from './lib/components/LoadingScreenContent';
export * from './lib/components/LoadingIndicator';
export * from './lib/components/IOScrollViewWithLargeHeader';
export * from './lib/components/IOScrollView';
export * from './lib/middleware/listener/effects';
export * from './lib/persistors/secureStorage';
export * from './lib/utils/clipboard';
export * from './lib/components/AnimatedImage';
export * from './lib/components/FocusAwareStatusBar';
export * from './lib/utils/color';
export * from './lib/utils/crypto';
export * from './lib/components/IOScrollViewWithReveal';
export * from './lib/hooks/useFooterActionsMargin';
export * from './lib/utils/asyncStatus';
export * from './lib/components/utils/buttons';
export * from './lib/utils/common';
export * from './lib/utils/env';
export * from './lib/hooks/theme';
export * from './lib/types/pin';
export * from './lib/utils/pin';
export * from './lib/hooks/usePreventScreenCapture';

export const resource: Resource = {
  it: {
    common: jsonLocale
  }
};

export type DefaultResource = {
  common: typeof jsonLocale;
};
