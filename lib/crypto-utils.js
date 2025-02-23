import * as CryptoJS from 'crypto-js.min.js';

export function hashPassphrase(passphrase) {
  return CryptoJS.SHA256(passphrase).toString();
}

export function encryptText(text, passphrase) {
  const hashedPassphrase = hashPassphrase(passphrase);
  return CryptoJS.AES.encrypt(text, hashedPassphrase).toString();
}

export function decryptText(encryptedText, passphrase) {
  const hashedPassphrase = hashPassphrase(passphrase);
  const bytes = CryptoJS.AES.decrypt(encryptedText, hashedPassphrase);
  return bytes.toString(CryptoJS.enc.Utf8);
}
