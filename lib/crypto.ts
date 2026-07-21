import 'server-only';
import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.APP_SECRET_KEY;

if (!SECRET_KEY) {
  throw new Error('Missing required env var: APP_SECRET_KEY');
}

export function encrypt(text: string) {
  if (!SECRET_KEY) {
    throw new Error('Missing required env var: APP_SECRET_KEY');
  }
  const cipherText = CryptoJS.AES.encrypt(text, SECRET_KEY).toString();

  return cipherText.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decrypt(safeCipherText: string) {
  if (!SECRET_KEY) {
    throw new Error('Missing required env var: APP_SECRET_KEY');
  }
  let cipherText = safeCipherText.replace(/-/g, '+').replace(/_/g, '/');

  while (cipherText.length % 4) {
    cipherText += '=';
  }

  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedText) return null;

    return decryptedText;
  } catch {
    return null;
  }
}
