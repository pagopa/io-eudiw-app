import {
  HeaderActionProps,
  HeaderSecondLevel
} from '@pagopa/io-app-design-system';
import {useNavigation} from '@react-navigation/native';
import * as React from 'react';
import {ComponentProps, useLayoutEffect, useMemo} from 'react';

type SpecificHookProps = {
  canGoBack?: boolean;
  /* On the surface, this prop seems useless, but it's used
  to programmatically hide the header.
  See PR#5795 for more details. */
  headerShown?: boolean;
};

/* Tried to spread the props of the `HeaderSecondLevel` component,
but caused some type mismatches, so it's better to pick some specific
props without manually (re)declaring each prop */
type HeaderHookManagedProps = Pick<
  ComponentProps<typeof HeaderSecondLevel>,
  | 'title'
  | 'backAccessibilityLabel'
  | 'backTestID'
  | 'goBack'
  | 'transparent'
  | 'scrollValues'
  | 'variant'
  | 'backgroundColor'
  | 'enableDiscreteTransition'
  | 'animatedRef'
>;

type HeaderActionConfigProps = Pick<
  React.ComponentProps<typeof HeaderSecondLevel>,
  'type' | 'firstAction' | 'secondAction' | 'thirdAction'
>;

type NoAdditionalActions = {
  secondAction?: never;
  thirdAction?: never;
};

type WithAdditionalActions =
  | NoAdditionalActions
  | {
      secondAction: HeaderActionProps;
      thirdAction?: HeaderActionProps;
    };

type PropsWithSupport = SpecificHookProps &
  HeaderHookManagedProps & {
    supportRequest: true;
  } & WithAdditionalActions;

type PropsWithoutSupport = SpecificHookProps &
  HeaderHookManagedProps & {
    supportRequest?: false;
    faqCategories?: never;
    contextualHelp?: never;
    contextualHelpMarkdown?: never;
  } & NoAdditionalActions;

export type HeaderSecondLevelHookProps = PropsWithSupport | PropsWithoutSupport;

type HeaderProps = ComponentProps<typeof HeaderSecondLevel>;

/**
 * This hook sets the `HeaderSecondLevel` in a screen using the `useLayoutEffect` hook.
 * @param canGoBack - Completely disable `Back` button.
 * @param headerShown - Hide the header programmatically.
 * @param props - Props to configure the header. Not all original props are supported.
 */
export const useHeaderSecondLevel = ({
  title,
  backAccessibilityLabel,
  backTestID,
  goBack,
  headerShown = true,
  canGoBack = true,
  supportRequest,
  secondAction,
  thirdAction,
  transparent = false,
  scrollValues,
  variant,
  backgroundColor,
  enableDiscreteTransition,
  animatedRef
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
            enableDiscreteTransition,
            animatedRef
          }
        : {};

    return {
      scrollValues,
      variant,
      backgroundColor,
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
      icon: 'help',
      onPress: () => void 0,
      accessibilityLabel: 'TEST'
    };

    // Three actions
    if (secondAction && thirdAction) {
      return {
        type: 'threeActions',
        firstAction: helpAction,
        secondAction,
        thirdAction
      };
    }

    // Two actions
    if (secondAction) {
      return {
        type: 'twoActions',
        firstAction: helpAction,
        secondAction
      };
    }

    // Just `Help` action
    return {
      type: 'singleAction',
      firstAction: helpAction
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
