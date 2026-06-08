const crypto = require('crypto');

const polyfill = function (arr) {
  return crypto.randomFillSync(arr);
};

// Polyfill global crypto
if (!globalThis.crypto) {
  globalThis.crypto = crypto.webcrypto || crypto;
}
if (globalThis.crypto && !globalThis.crypto.getRandomValues) {
  globalThis.crypto.getRandomValues = polyfill;
}

// Polyfill crypto modules
try {
  if (!crypto.getRandomValues) {
    Object.defineProperty(crypto, 'getRandomValues', {
      value: polyfill,
      writable: true,
      configurable: true
    });
  }
  const nodeCrypto = require('node:crypto');
  if (!nodeCrypto.getRandomValues) {
    Object.defineProperty(nodeCrypto, 'getRandomValues', {
      value: polyfill,
      writable: true,
      configurable: true
    });
  }
} catch (e) {
  // Silent fail
}
