export function generateNumericPin(length = 10, cryptoSource = globalThis.crypto) {
  if (!Number.isInteger(length) || length < 6 || length > 12) {
    throw new RangeError('PIN length must be an integer from 6 to 12');
  }
  if (!cryptoSource || typeof cryptoSource.getRandomValues !== 'function') {
    throw new Error('Secure random number generation is unavailable');
  }

  let pin = '';
  while (pin.length < length) {
    const bytes = new Uint8Array((length - pin.length) * 2);
    cryptoSource.getRandomValues(bytes);
    for (const byte of bytes) {
      // 250 is the largest multiple of 10 below 256. Rejecting 250–255 keeps
      // every decimal digit equally likely instead of introducing modulo bias.
      if (byte >= 250) continue;
      pin += String(byte % 10);
      if (pin.length === length) break;
    }
  }
  return pin;
}
