/**
 * Generates a secure random password
 * @param {number} length - Length of the password (default: 16)
 * @returns {string} - Generated password
 */
export const generateKey = ({
  length = 32,
  uppercase = true,
  lowercase = true,
  numbers = true,
  symbols = true,
} = {}) => {
  const sets = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  };

  let pool = "";
  const required = [];

  if (uppercase) {
    pool += sets.uppercase;
    required.push(sets.uppercase);
  }
  if (lowercase) {
    pool += sets.lowercase;
    required.push(sets.lowercase);
  }
  if (numbers) {
    pool += sets.numbers;
    required.push(sets.numbers);
  }
  if (symbols) {
    pool += sets.symbols;
    required.push(sets.symbols);
  }

  if (!pool) {
    throw new Error("At least one character set must be enabled");
  }

  if (length < required.length) {
    throw new Error("Length too short for selected character sets");
  }

  const cryptoObj = globalThis?.crypto;
  const randomInt = (max) =>
    cryptoObj.getRandomValues(new Uint32Array(1))[0] % max;

  const result = [];

  // Guarantee at least one char per enabled set
  for (const set of required) {
    result.push(set[randomInt(set.length)]);
  }

  // Fill remaining characters
  for (let i = result.length; i < length; i++) {
    result.push(pool[randomInt(pool.length)]);
  }

  // Fisher–Yates shuffle (unbiased)
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result.join("");
};
