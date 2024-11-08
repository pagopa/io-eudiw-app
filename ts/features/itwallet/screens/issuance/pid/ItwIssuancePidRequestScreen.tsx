import React, { useEffect } from "react";
import { SafeAreaView } from "react-native";
import { Route, useRoute } from "@react-navigation/core";
import { useNavigation } from "@react-navigation/native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { IOStyles } from "@pagopa/io-app-design-system";
import I18n from "../../../../../i18n";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import ItwLoadingSpinnerOverlay from "../../../components/ItwLoadingSpinnerOverlay";
import { ITW_ROUTES } from "../../../navigation/ItwRoutes";
import { itwIssuancePidSelector } from "../../../store/reducers/itwIssuancePidReducer";
import { itwActivationStop } from "../../../store/actions/itwActivationActions";
import ItwKoView from "../../../components/ItwKoView";
import {
  ItWalletError,
  getItwGenericMappedError
} from "../../../utils/itwErrorsUtils";
import {
  getPidCredentialCatalogItem,
  PidData
} from "../../../utils/itwMocksUtils";
import { itwIssuancePid } from "../../../store/actions/itwIssuancePidActions";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";

/**
 * ItwIssuancePidRequestScreen's navigation params.
 * The pidData consists of the data needed to request a PID.
 */
export type ItwIssuancePidRequestScreenNavigationParams = {
  pidData: PidData;
};

/**
 * Renders a preview screen which requests a PID.
 */
const ItwIssuancePidRequestScreen = () => {
  const route =
    useRoute<
      Route<
        "ITW_ACTIVATION_PID_REQUEST",
        ItwIssuancePidRequestScreenNavigationParams
      >
    >();
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const dispatch = useIODispatch();
  const pid = useIOSelector(itwIssuancePidSelector);
  const pidCredentialCatalogItem = getPidCredentialCatalogItem();

  useHeaderSecondLevel({
    title: I18n.t("features.itWallet.issuing.title")
  });

  /**
   * Dispatches the PID request on first render.
   */
  useOnFirstRender(() => {
    dispatch(
      itwIssuancePid.request({
        ...pidCredentialCatalogItem,
        pidData: route.params.pidData
      })
    );
  });

  /**
   * Navigates to the PID preview screen when the PID is available.
   * This prevents the "cannot update a component while rendering a different component" error
   * if the navigation is called directly during the pot fold.
   */
  useEffect(() => {
    if (pot.isSome(pid)) {
      navigation.navigate(ITW_ROUTES.ISSUANCE.PID.PREVIEW);
    }
  }, [navigation, pid]);

  /**
   * Renders the loading spinner.
   * @returns a loading spinner overlay
   */
  const LoadingView = () => (
    <ItwLoadingSpinnerOverlay
      captionTitle={I18n.t("features.itWallet.issuing.loading.title")}
      isLoading
    >
      <></>
    </ItwLoadingSpinnerOverlay>
  );

  /**
   * Error view component which currently displays a generic error.
   * @param error - optional ItWalletError to be displayed.
   */
  const ErrorView = ({ error: _ }: { error?: ItWalletError }) => {
    const mappedError = getItwGenericMappedError(() =>
      dispatch(itwActivationStop())
    );
    return <ItwKoView {...mappedError} />;
  };

  const RenderMask = () =>
    pot.fold(
      pid,
      () => <LoadingView />,
      () => <LoadingView />,
      () => <LoadingView />,
      err => <ErrorView error={err} />,
      () => <LoadingView />,
      () => <LoadingView />,
      () => <LoadingView />,
      (_, someErr) => <ErrorView error={someErr} />
    );

  return <SafeAreaView style={IOStyles.flex}>{RenderMask()}</SafeAreaView>;
};

export default ItwIssuancePidRequestScreen;
