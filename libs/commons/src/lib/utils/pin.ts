export const PIN_LENGTH = 6;

type SequenceOrder = 'ASCENDING' | 'DESCENDING';

/**
 * Checks if a sequence of digits is in ascending or descending order.
 *
 * @param sequenceOrder - The order of the sequence, either 'ASCENDING' or 'DESCENDING'.
 * @returns A function that takes an array of digits and returns true if the digits are in the specified sequence order.
 */
const checkSequence =
  (sequenceOrder: SequenceOrder) => (digits: Array<number>) =>
    digits
      .slice(1)
      .every(
        (digit, i) =>
          digit === digits[i] + (sequenceOrder === 'ASCENDING' ? 1 : -1)
      );

/**
 * Check if a given input is a valid PIN number. A valid PIN number must:
 * - Be a string of 6 digits
 * - Not contain all the same digits
 * - Not be in ascending or descending order
 * @param input - The input to check
 * @returns true if the input is a valid PIN number, false otherwise
 */
export function isValidPinNumber(input: number | string): boolean {
  const str = String(input);

  // Check for non-numeric strings and for strings of incorrect length
  if (!/^\d{6}$/.test(str)) {
    return false;
  }

  // Check if all digits are the same
  if (new Set(str).size === 1) {
    return false;
  }

  // Generate an array of digits
  const digits = Array.from(str, Number);

  // Check for ascending sequence
  const isAscending = checkSequence('ASCENDING')(digits);

  if (isAscending) {
    return false;
  }

  // Check for descending sequence
  const isDescending = checkSequence('DESCENDING')(digits);

  if (isDescending) {
    return false;
  }

  return true;
}
