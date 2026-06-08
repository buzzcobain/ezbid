import crypto from 'crypto';
import nodeCrypto from 'node:crypto';

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

// Polyfill crypto module exports
try {
  if (!crypto.getRandomValues) {
    Object.defineProperty(crypto, 'getRandomValues', {
      value: polyfill,
      writable: true,
      configurable: true
    });
  }
} catch (e) {
  console.warn('Failed to define getRandomValues on crypto:', e);
}

try {
  if (!nodeCrypto.getRandomValues) {
    Object.defineProperty(nodeCrypto, 'getRandomValues', {
      value: polyfill,
      writable: true,
      configurable: true
    });
  }
} catch (e) {
  console.warn('Failed to define getRandomValues on node:crypto:', e);
}

import { build } from 'vite';

build().then(() => {
  console.log('Build completed successfully.');
}).catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
