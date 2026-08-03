import {
  HeaderActionProps,
  HeaderSecondLevel
} from '@pagopa/io-app-design-system';
import { useNavigation } from '@react-navigation/native';
import { ComponentProps, useLayoutEffect, useMemo } from 'react';

export type HeaderSecondLevelHookProps = PropsWithoutSupport | PropsWithSupport;

type HeaderActionConfigProps = Pick<
  React.ComponentProps<typeof HeaderSecondLevel>,
  'firstAction' | 'secondAction' | 'thirdAction' | 'type'
>;

/* Tried to spread the props of the `HeaderSecondLevel` component,
but caused some type mismatches, so it's better to pick some specific
props without manually (re)declaring each prop */
type HeaderHookManagedProps = Pick<
  ComponentProps<typeof HeaderSecondLevel>,
  | 'animatedRef'
  | 'backAccessibilityLabel'
  | 'backgroundColor'
  | 'backTestID'
  | 'enableDiscreteTransition'
  | 'goBack'
  | 'scrollValues'
  | 'title'
  | 'transparent'
  | 'variant'
>;

type HeaderProps = ComponentProps<typeof HeaderSecondLevel>;

type NoAdditionalActions = {
  secondAction?: never;
  thirdAction?: never;
};

type PropsWithoutSupport = HeaderHookManagedProps &
  NoAdditionalActions &
  SpecificHookProps & {
    contextualHelp?: never;
    contextualHelpMarkdown?: never;
    faqCategories?: never;
    supportRequest?: false;
  };

type PropsWithSupport = HeaderHookManagedProps &
  SpecificHookProps &
  WithAdditionalActions & {
    supportRequest: true;
  };

type SpecificHookProps = {
  canGoBack?: boolean;
  /* On the surface, this prop seems useless, but it's used
  to programmatically hide the header.
  See PR#5795 for more details. */
  headerShown?: boolean;
};

type WithAdditionalActions =
  | NoAdditionalActions
  | {
      secondAction: HeaderActionProps;
      thirdAction?: HeaderActionProps;
    };

/**
 * This hook sets the `HeaderSecondLevel` in a screen using the `useLayoutEffect` hook.
 * @param canGoBack - Completely disable `Back` button.
 * @param headerShown - Hide the header programmatically.
 * @param props - Props to configure the header. Not all original props are supported.
 */
export const useHeaderSecondLevel = ({
  animatedRef,
  backAccessibilityLabel,
  backgroundColor,
  backTestID,
  canGoBack = true,
  enableDiscreteTransition,
  goBack,
  headerShown = true,
  scrollValues,
  secondAction,
  supportRequest,
  thirdAction,
  title,
  transparent = false,
  variant
}: HeaderSecondLevelHookProps) => {
  const navigation = useNavigation();

  const backProps = useMemo(
    () =>
      canGoBack
        ? {
            backAccessibilityLabel: backAccessibilityLabel ?? 'BACK',
            backTestID,
            goBack: goBack ?? navigation.goBack
          }
        : {},
    [canGoBack, backAccessibilityLabel, backTestID, goBack, navigation.goBack]
  );

  const graphicProps = useMemo(() => {
    const enableDiscreteTransitionProps =
      enableDiscreteTransition && animatedRef
        ? {
            animatedRef,
            enableDiscreteTransition
          }
        : {};

    return {
      backgroundColor,
      scrollValues,
      variant,
      ...enableDiscreteTransitionProps
    };
  }, [
    enableDiscreteTransition,
    animatedRef,
    scrollValues,
    variant,
    backgroundColor
  ]);

  const helpProps: HeaderActionConfigProps = useMemo(() => {
    if (!supportRequest) {
      return {
        type: 'base'
      };
    }

    const helpAction: HeaderActionProps = {
      accessibilityLabel: '',
      icon: 'help',
      onPress: () => void 0
    };

    // Three actions
    if (secondAction && thirdAction) {
      return {
        firstAction: helpAction,
        secondAction,
        thirdAction,
        type: 'threeActions'
      };
    }

    // Two actions
    if (secondAction) {
      return {
        firstAction: helpAction,
        secondAction,
        type: 'twoActions'
      };
    }

    // Just `Help` action
    return {
      firstAction: helpAction,
      type: 'singleAction'
    };
  }, [supportRequest, secondAction, thirdAction]);

  const headerComponentProps = useMemo(
    () => ({
      title,
      ...graphicProps,
      ...backProps,
      ...helpProps
    }),
    [title, graphicProps, backProps, helpProps]
  ) as HeaderProps;

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          {...headerComponentProps}
          transparent={transparent}
        />
      ),
      headerShown,
      headerTransparent: transparent
    });
  }, [headerComponentProps, headerShown, navigation, transparent]);
};
