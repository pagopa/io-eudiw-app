import * as React from "react";
import IdentificationModal from "./IdentificationModal";

type Props = {};

/**
 * This is a wrapper of all possible modals the app can show (without user interaction), in this order:
 * - SystemOffModal -> when backend systems are off the app avoids its usage by showing a modal
 * - UpdateAppModal -> when the backend is not compliant anymore with the app, this modal is shown to force an update
 * - IdentificationModal -> the default case. It renders itself only if an identification action is required
 */
const RootModal: React.FunctionComponent<Props> = (_: Props) => {
  return <IdentificationModal />;
};

export default RootModal;
