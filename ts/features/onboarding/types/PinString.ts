import { z } from 'zod';
import { PIN_LENGTH } from '../../../utils/pin';

/**
 * A string representing a PIN which follows the PIN_REGEX constraint.
 */

// Define the regex pattern dynamically
const PIN_REGEX = new RegExp(`^[0-9]{${PIN_LENGTH}}$`);

// Create the PinString schema
const PinStringSchema = z.string().regex(PIN_REGEX);

// TypeScript type for PinString
export type PinString = z.infer<typeof PinStringSchema>;
