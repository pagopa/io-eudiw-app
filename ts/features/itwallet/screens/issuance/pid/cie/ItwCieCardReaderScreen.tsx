/**
 * A screen to guide the user to proper read the CIE
 * TODO: isolate cie event listener as saga
 * TODO: when 100% is reached, the animation end
 */
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { constNull } from "fp-ts/lib/function";
import * as React from "react";
import {
  View,
  AccessibilityInfo,
  Platform,
  StyleSheet,
  Text,
  SafeAreaView,
  Pressable
} from "react-native";
import {
  VSpacer,
  IOColors,
  H2,
  ButtonSolid,
  Body,
  IOStyles,
  HeaderSecondLevel,
  Stepper
} from "@pagopa/io-app-design-system";
import I18n from "../../../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../../../navigation/params/AppParamsList";
import { isScreenReaderEnabled } from "../../../../../../utils/accessibility";
import { isIos } from "../../../../../../utils/platform";
import { ITW_ROUTES } from "../../../../navigation/ItwRoutes";
import { ItwParamsList } from "../../../../navigation/ItwParamsList";
import CieReadingCardAnimation, {
  ReadingState
} from "../../../../components/cie/CieReadingCardAnimation";
import { useHeaderSecondLevel } from "../../../../../../hooks/useHeaderSecondLevel";
import { pidDataMock } from "../../../../utils/itwMocksUtils";

export type ItwCieCardReaderScreenNavigationParams = {
  ciePin: string;
};

type NavigationProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_ISSUANCE_PID_CIE_CARD_READER_SCREEN"
>;

type Props = NavigationProps;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: IOColors.white
  },
  textCenter: {
    textAlign: "center"
  }
});

type State = {
  // Get the current status of the card reading
  readingState: ReadingState;
  title: string;
  subtitle: string;
  content?: string;
  errorMessage?: string;
  isScreenReaderEnabled: boolean;
  tapCounter: number;
};

type TextForState = {
  title: string;
  subtitle: string;
  content: string;
};

// some texts changes depending on current running Platform
const getTextForState = (
  state: ReadingState.waiting_card | ReadingState.error,
  _: string = ""
): TextForState => {
  const texts: Record<
    ReadingState.waiting_card | ReadingState.error,
    TextForState
  > = {
    [ReadingState.waiting_card]: {
      title: I18n.t("features.itWallet.issuing.cie.waiting.title"),
      subtitle: I18n.t("authentication.cie.card.layCardMessageHeader"),
      content: I18n.t("features.itWallet.issuing.cie.waiting.content")
    },
    [ReadingState.error]: {
      title: I18n.t("features.itWallet.issuing.cie.error.title"),
      subtitle: "",
      content: ""
    }
  };
  return texts[state];
};

/**
 *  This screen shown while reading the card
 */
class ItwCieCardReaderScreen extends React.PureComponent<Props, State> {
  private subTitleRef = React.createRef<Text>();

  constructor(props: Props) {
    super(props);
    this.state = {
      /*
      These are the states that can occur when reading the cie (from SDK)
      - waiting_card (we are ready for read ->radar effect)
      - reading (we are reading the card -> progress animation)
      - error (the reading is interrupted -> progress animation stops and the progress circle becomes red)
      - completed (the reading has been completed)
      */
      readingState: ReadingState.waiting_card,
      ...getTextForState(ReadingState.waiting_card),
      isScreenReaderEnabled: false,
      tapCounter: 0
    };
    this.props.navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          type="base"
          title={I18n.t("authentication.cie.card.headerTitle")}
        />
      )
    });
  }

  private announceUpdate = () => {
    if (this.state.content) {
      AccessibilityInfo.announceForAccessibility(this.state.content);
    }
  };

  private updateContent = () => {
    switch (this.state.readingState) {
      case ReadingState.reading:
        this.setState(
          {
            title: I18n.t("features.itWallet.issuing.cie.reading.title"),
            subtitle: I18n.t("authentication.cie.card.readerCardHeader"),
            content: ""
          },
          this.announceUpdate
        );
        break;
      case ReadingState.error:
        this.setState(
          state => getTextForState(ReadingState.error, state.errorMessage),
          this.announceUpdate
        );
        break;
      case ReadingState.completed:
        this.setState(
          {
            title: I18n.t("features.itWallet.issuing.cie.success.title"),
            subtitle: I18n.t("authentication.cie.card.cieCardValid"),
            // duplicate message so screen reader can read the updated message
            content: I18n.t("features.itWallet.issuing.cie.success.content")
          },
          this.announceUpdate
        );
        break;
      // waiting_card state
      default:
        this.setState(
          getTextForState(ReadingState.waiting_card),
          this.announceUpdate
        );
    }
  };

  public async componentDidMount() {
    this.setState({ readingState: ReadingState.waiting_card });
    const srEnabled = await isScreenReaderEnabled();
    this.setState({ isScreenReaderEnabled: srEnabled });
  }

  componentDidUpdate() {
    if (this.state.tapCounter === 1) {
      this.setState({ readingState: ReadingState.reading });
      this.updateContent();
    } else if (this.state.tapCounter === 2) {
      this.setState({ readingState: ReadingState.completed });
      this.updateContent();
    } else if (this.state.tapCounter === 3) {
      this.props.navigation.navigate(ITW_ROUTES.MAIN, {
        screen: ITW_ROUTES.ISSUANCE.PID.CIE.CONSENT_DATA_USAGE,
        params: {
          pidData: pidDataMock
        }
      });
    }
  }

  public render(): React.ReactNode {
    return (
      <>
        <SafeAreaView style={IOStyles.flex}>
          <Stepper steps={3} currentStep={2} />
          <VSpacer size={16} />
          <Pressable
            onPress={() =>
              this.setState({ tapCounter: this.state.tapCounter + 1 })
            }
            accessibilityRole="button"
          >
            <CieReadingCardAnimation readingState={this.state.readingState} />
          </Pressable>
          {isIos && <VSpacer size={16} />}
          <View style={IOStyles.horizontalContentPadding}>
            <H2 style={styles.textCenter}>{this.state.title}</H2>
            <Body style={styles.textCenter} accessible={true}>
              {this.state.content}
            </Body>
            {this.state.readingState === ReadingState.error && (
              <ButtonSolid
                onPress={() =>
                  this.setState(
                    { readingState: ReadingState.waiting_card },
                    () => this.updateContent()
                  )
                }
                label={I18n.t("features.itWallet.issuing.cie.error.retry")}
                accessibilityLabel={I18n.t(
                  "features.itWallet.issuing.cie.error.retry"
                )}
                fullWidth={true}
              />
            )}
          </View>
        </SafeAreaView>
      </>
    );
  }
}

const ReaderScreen = (props: Props) => {
  useHeaderSecondLevel({
    title: "",
    supportRequest: true
  });

  return (
    <View style={styles.container}>
      <ItwCieCardReaderScreen {...props} />
    </View>
  );
};

export default ReaderScreen;
