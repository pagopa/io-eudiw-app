import React, { useCallback, useRef, useState } from "react";
import {
  Body,
  ContentWrapper,
  HeaderFirstLevel,
  ListItemSwitch,
  useIOToast
} from "@pagopa/io-app-design-system";
import type { Millisecond } from "@pagopa/ts-commons/lib/units";
import AppVersion from "../../components/AppVersion";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import { isDebugModeEnabledSelector } from "../../store/reducers/debug";
import { setDebugModeEnabled } from "../../store/actions/debug";
import I18n from "../../i18n";

const consecutiveTapRequired = 4;
const RESET_COUNTER_TIMEOUT = 2000 as Millisecond;

const ProfileMainScreen = () => {
  const [tapsOnAppVersion, setTapsOnAppVersion] = useState(0);
  const idResetTap = useRef<ReturnType<typeof setInterval>>();

  const dispatch = useIODispatch();
  const { show } = useIOToast();
  const isDebugModeEnabled = useIOSelector(isDebugModeEnabledSelector);

  const resetAppTapCounter = useCallback(() => {
    setTapsOnAppVersion(0);
    clearInterval(idResetTap.current);
  }, []);

  // When tapped 5 times activate the debug mode of the application.
  // If more than two seconds pass between taps, the counter is reset
  const onTapAppVersion = useCallback(() => {
    if (idResetTap.current) {
      clearInterval(idResetTap.current);
    }
    // do nothing
    if (isDebugModeEnabled) {
      return;
    }
    if (tapsOnAppVersion === consecutiveTapRequired) {
      dispatch(setDebugModeEnabled(true));
      setTapsOnAppVersion(0);
      show(I18n.t("profile.main.developerModeOn"));
    } else {
      // eslint-disable-next-line functional/immutable-data
      idResetTap.current = setInterval(
        resetAppTapCounter,
        RESET_COUNTER_TIMEOUT
      );
      setTapsOnAppVersion(prevTaps => prevTaps + 1);
    }
  }, [
    isDebugModeEnabled,
    resetAppTapCounter,
    dispatch,
    show,
    tapsOnAppVersion
  ]);

  return (
    <>
      <HeaderFirstLevel title={I18n.t("profile.main.title")} type="base" />
      <ContentWrapper>
        <Body>Profile screen - TODO</Body>
        {isDebugModeEnabled ? (
          <ListItemSwitch
            label={I18n.t("profile.main.debugMode")}
            value={isDebugModeEnabled}
            onSwitchValueChange={enabled =>
              dispatch(setDebugModeEnabled(enabled))
            }
          />
        ) : null}
        <AppVersion onPress={onTapAppVersion} />
      </ContentWrapper>
    </>
  );
};

export default ProfileMainScreen;