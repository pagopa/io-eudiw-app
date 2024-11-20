import {z} from 'zod';
import {PIN_LENGTH} from '../../../utils/pin';

// Define the regex pattern dynamically
const PIN_REGEX = new RegExp(`^[0-9]{${PIN_LENGTH}}$`);

// Create the PinString schema
export const PinString = z.string().regex(PIN_REGEX);

// TypeScript type for PinString
export type PinString = z.infer<typeof PinString>;
