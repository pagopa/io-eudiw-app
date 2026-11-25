import {
  generatePassword,
  getPasswordRequirements,
  isValidPassword
} from '../password';

jest.mock('expo-crypto', () => ({
  getRandomBytes: (length: number) =>
    new Uint8Array(
      jest.requireActual<typeof import('crypto')>('crypto').randomBytes(length)
    )
}));

describe('isValidPassword', () => {
  it.each(['Parola-1234', 'It-w2892', 'aB3$cd'])('accepts %s', password => {
    expect(isValidPassword(password)).toBe(true);
  });

  it.each([
    ['too short', 'aB3$c'],
    ['without uppercase letters', 'parola-1234'],
    ['without lowercase letters', 'PAROLA-1234'],
    ['without digits', 'Parola-abcd'],
    ['without special characters', 'Parola1234'],
    ['with whitespace as the only special character', 'Parola 1234']
  ])('rejects a password %s', (_, password) => {
    expect(isValidPassword(password)).toBe(false);
  });
});

describe('getPasswordRequirements', () => {
  it('reports each satisfied character class', () => {
    expect(getPasswordRequirements('Parola-')).toEqual({
      digit: false,
      lowercase: true,
      special: true,
      uppercase: true
    });
  });
});

describe('generatePassword', () => {
  it('always generates a valid password', () => {
    const passwords = Array.from({ length: 500 }, generatePassword);
    passwords.forEach(password => {
      expect(isValidPassword(password)).toBe(true);
    });
    expect(new Set(passwords).size).toBeGreaterThan(490);
  });
});
