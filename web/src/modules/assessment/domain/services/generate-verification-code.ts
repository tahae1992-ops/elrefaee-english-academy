/**
 * DDD §3.4: certificate `verification_code` must be non-guessable,
 * not sequential -- a sequential id here would make certificate
 * forgery-by-guessing trivial on a public, unauthenticated endpoint
 * (API Spec §7.4). Alphabet excludes visually ambiguous characters
 * (0/O, 1/I/L) since this code is meant to be read off a printed/
 * shared certificate and typed back in by a third party.
 */
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const CODE_LENGTH = 12;

export function generateVerificationCode(randomBytes: (length: number) => Uint8Array = cryptoRandomBytes): string {
  const bytes = randomBytes(CODE_LENGTH);
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return code;
}

function cryptoRandomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
}
