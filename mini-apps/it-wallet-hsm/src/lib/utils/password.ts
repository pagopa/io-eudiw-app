import * as Crypto from 'expo-crypto';

/**
 * Minimum length of the HSM password, which is the PIN protecting the PID key on the Remote WSCD.
 * It must match the NSSAM PIN policy, otherwise the key enrollment fails with `WEAK_PIN`.
 */
export const PASSWORD_MIN_LENGTH = 6;

// Characters which are easily confused (e.g. I, l, O, 0, 1) are excluded to ease copying the password by hand
const CHARSETS = {
  digit: '23456789',
  lowercase: 'abcdefghijkmnpqrstuvwxyz',
  special: '-_.!?#@',
  uppercase: 'ABCDEFGHJKLMNPQRSTUVWXYZ'
} as const;

export type PasswordRequirement =
  | 'digit'
  | 'lowercase'
  | 'special'
  | 'uppercase';

const REQUIREMENT_PATTERNS: Record<PasswordRequirement, RegExp> = {
  digit: /[0-9]/,
  lowercase: /[a-z]/,
  special: /[^A-Za-z0-9\s]/,
  uppercase: /[A-Z]/
};

export const PASSWORD_REQUIREMENTS = Object.keys(
  REQUIREMENT_PATTERNS
) as readonly PasswordRequirement[];

/**
 * Checks which character class requirements of the NSSAM PIN policy a password satisfies.
 */
export const getPasswordRequirements = (
  password: string
): Record<PasswordRequirement, boolean> => ({
  digit: REQUIREMENT_PATTERNS.digit.test(password),
  lowercase: REQUIREMENT_PATTERNS.lowercase.test(password),
  special: REQUIREMENT_PATTERNS.special.test(password),
  uppercase: REQUIREMENT_PATTERNS.uppercase.test(password)
});

/**
 * Checks whether a password satisfies the NSSAM PIN policy: minimum length and all the character classes.
 */
export const isValidPassword = (password: string) =>
  password.length >= PASSWORD_MIN_LENGTH &&
  Object.values(getPasswordRequirements(password)).every(Boolean);

/**
 * Returns a uniformly distributed random integer in [0, max) using a CSPRNG, avoiding the modulo bias.
 */
const randomInt = (max: number): number => {
  const limit = 256 - (256 % max);
  while (true) {
    const [byte] = Crypto.getRandomBytes(1);
    if (byte !== undefined && byte < limit) {
      return byte % max;
    }
  }
};

const pick = (charset: string) => charset.charAt(randomInt(charset.length));

/**
 * Generates a random password which satisfies the NSSAM PIN policy.
 */
export const generatePassword = (): string => {
  const required = Object.values(CHARSETS).map(pick);
  const all = Object.values(CHARSETS).join('');
  const chars = [
    ...required,
    ...Array.from({ length: PASSWORD_MIN_LENGTH - required.length }, () =>
      pick(all)
    )
  ];
  // Fisher-Yates shuffle, so the required characters are not in a predictable position
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j] as string, chars[i] as string];
  }
  return chars.join('');
};
