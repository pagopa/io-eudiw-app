import { Banner, Body, H2, VSpacer } from "@pagopa/io-app-design-system";
import React, { ComponentProps, useMemo } from "react";

import { ContextualHelpPropsMarkdown } from "../../../components/screens/BaseScreenComponent";
import I18n from "../../../i18n";
import { preferenceFingerprintIsEnabledSaveSuccess } from "../../../store/actions/persistedPreferences";
import { useIODispatch } from "../../../store/hooks";
import {
  BiometriActivationUserType,
  mayUserActivateBiometric
} from "../../../utils/biometrics";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { FAQsCategoriesType } from "../../../utils/faq";
import { IOScrollView } from "../../../components/ui/IOScrollView";
import { useOnboardingAbortAlert } from "../../../utils/hooks/useOnboardingAbortAlert";

type IOScrollViewActions = ComponentProps<typeof IOScrollView>["actions"];

const FAQ_CATEGORIES: ReadonlyArray<FAQsCategoriesType> = [
  "onboarding_fingerprint"
];

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "onboarding.contextualHelpTitle",
  body: "onboarding.contextualHelpContent"
};

/**
 * A screen to show, if the fingerprint is supported by the device,
 * the instruction to enable the fingerprint/faceID usage
 */
const FingerprintScreen = () => {
  const dispatch = useIODispatch();
  const { showAlert } = useOnboardingAbortAlert();

  useHeaderSecondLevel({
    goBack: showAlert,
    title: "",
    faqCategories: FAQ_CATEGORIES,
    supportRequest: true,
    contextualHelpMarkdown
  });

  const actions = useMemo<IOScrollViewActions>(
    () => ({
      type: "TwoButtons",
      primary: {
        label: I18n.t("global.buttons.activate2"),
        accessibilityLabel: I18n.t("global.buttons.activate2"),
        onPress: () => {
          mayUserActivateBiometric()
            .then(_ => {
              dispatch(
                preferenceFingerprintIsEnabledSaveSuccess({
                  isFingerprintEnabled: true
                })
              );
            })
            .catch((err: BiometriActivationUserType) => {
              if (err === "PERMISSION_DENIED") {
                dispatch(
                  preferenceFingerprintIsEnabledSaveSuccess({
                    isFingerprintEnabled: false
                  })
                );
              }
            });
        }
      },
      secondary: {
        label: I18n.t("global.buttons.notNow"),
        accessibilityLabel: I18n.t("global.buttons.notNow"),
        onPress: () => {
          dispatch(
            preferenceFingerprintIsEnabledSaveSuccess({
              isFingerprintEnabled: false
            })
          );
        }
      }
    }),
    [dispatch]
  );

  return (
    <IOScrollView actions={actions}>
      <H2>{I18n.t("onboarding.biometric.available.title")}</H2>
      <VSpacer size={16} />
      <Body>{I18n.t("onboarding.biometric.available.body.text")}</Body>
      <VSpacer size={24} />
      <Banner
        content={I18n.t("onboarding.biometric.available.settings")}
        color="neutral"
        size="small"
        pictogramName="activate"
      />
    </IOScrollView>
  );
};

export default FingerprintScreen;
