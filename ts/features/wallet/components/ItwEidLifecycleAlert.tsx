import { Alert } from "@pagopa/io-app-design-system";
import { format } from "date-fns";
import { ComponentProps, useMemo } from "react";
import { View } from "react-native";
import I18n from "i18next";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  ItwJwtCredentialStatus
} from "../utils/itwTypesUtils";
import { StoredCredential } from "../utils/types";
import { useAppSelector } from "../../../store";
import { itwCredentialsEidSelector, itwCredentialsEidStatusSelector } from "../store/credentials";
import WALLET_ROUTES from "../navigation/routes";
import MAIN_ROUTES from "../../../navigation/main/routes";
import { MainNavigatorParamsList } from "../../../navigation/main/MainStackNavigator";

const defaultLifecycleStatus: Array<ItwJwtCredentialStatus> = [
  "valid",
  "jwtExpiring",
  "jwtExpired"
];

type Props = {
  /**
   * The eID statuses that will render the alert.
   */
  lifecycleStatus?: Array<ItwJwtCredentialStatus>;
  navigation: ReturnType<typeof useNavigation<NativeStackNavigationProp<MainNavigatorParamsList>>>;
};

/**
 * This component renders an alert that displays information on the eID status.
 */
export const ItwEidLifecycleAlert = ({
  lifecycleStatus = defaultLifecycleStatus,
  navigation
}: Props) => {
  const eidOption = useAppSelector(itwCredentialsEidSelector);
  const maybeEidStatus = useAppSelector(itwCredentialsEidStatusSelector);

  const startEidReissuing = () => {
    navigation.navigate(MAIN_ROUTES.WALLET_NAV, {
      screen: WALLET_ROUTES.PID_ISSUANCE.INSTANCE_CREATION
    });
  };

  const Content = ({
    eid,
    eidStatus
  }: {
    eid: StoredCredential;
    eidStatus: ItwJwtCredentialStatus;
  }) => {
    const nameSpace = "itw";

    const alertProps = useMemo<ComponentProps<typeof Alert>>(() => {
      const eIDAlertPropsMap: Record<
        ItwJwtCredentialStatus,
        ComponentProps<typeof Alert>
      > = {
        valid: {
          testID: "itwEidLifecycleAlertTestID_valid",
          variant: "success",
          content: I18n.t(
            `features.itWallet.presentation.bottomSheets.eidInfo.alert.${nameSpace}.valid`,
            {
              date: eid.issuedAt
                ? format(eid.issuedAt, "dd-MM-yyyy")
                : "-"
            }
          )
        },
        jwtExpiring: {
          testID: "itwEidLifecycleAlertTestID_jwtExpiring",
          variant: "warning",
          content: I18n.t(
            `features.itWallet.presentation.bottomSheets.eidInfo.alert.${nameSpace}.expiring`,
            // TODO [SIW-3225]: date in bold
            { date: format(eid.expiration, "dd-MM-yyyy") }
          ),
          action: I18n.t(
            `features.itWallet.presentation.bottomSheets.eidInfo.alert.${nameSpace}.action`
          ),
          onPress: startEidReissuing
        },
        jwtExpired: {
          testID: "itwEidLifecycleAlertTestID_jwtExpired",
          variant: "error",
          content: I18n.t(
            `features.itWallet.presentation.bottomSheets.eidInfo.alert.${nameSpace}.expired`
          ),
          action: I18n.t(
            `features.itWallet.presentation.bottomSheets.eidInfo.alert.${nameSpace}.action`
          ),
          onPress: startEidReissuing
        }
      };

      return eIDAlertPropsMap[eidStatus];
    }, [eidStatus, eid.issuedAt, eid.expiration, nameSpace]);

    if (!lifecycleStatus.includes(eidStatus)) {
      return null;
    }

    return (
      <View style={{ marginBottom: 16 }} testID={`itwEidLifecycleAlertTestID`}>
        <Alert {...alertProps} />
      </View>
    );
  };

  return eidOption && maybeEidStatus && <Content eid={eidOption} eidStatus={maybeEidStatus} />;
};
