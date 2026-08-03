import { identificationRootReducer } from './lib/reducer/index';
export * from './lib/components/IdentificationModal';
export {
  setIdentificationIdentified,
  setIdentificationStarted,
  setIdentificationUnidentified
} from './lib/reducer/identification';
export * from './lib/reducer/pin';
export * from './lib/utils/biometric';

export const identificationReducer = {
  identification: identificationRootReducer
};

export type IdentificationRootState = {
  identification: ReturnType<typeof identificationRootReducer>;
};
