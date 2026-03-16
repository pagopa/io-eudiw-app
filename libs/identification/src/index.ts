import { identificationRootReducer } from './lib/reducer/index';
export * from './lib/components/IdentificationModal';
export * from './lib/utils/biometric';
export * from './lib/reducer/pin';
export {
  setIdentificationUnidentified,
  setIdentificationStarted,
  setIdentificationIdentified
} from './lib/reducer/identification';

export const identificationReducer = {
  identification: identificationRootReducer
};

export type IdentificationRootState = {
  identification: ReturnType<typeof identificationRootReducer>;
};
