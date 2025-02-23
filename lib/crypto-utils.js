const CryptoJS = require('crypto-js');

function hashPassphrase(passphrase) {
  return CryptoJS.SHA256(passphrase).toString();
}

function encryptText(text, passphrase) {
  const hashedPassphrase = hashPassphrase(passphrase);
  return CryptoJS.AES.encrypt(text, hashedPassphrase).toString();
}

function decryptText(encryptedText, passphrase) {
  const hashedPassphrase = hashPassphrase(passphrase);
  const bytes = CryptoJS.AES.decrypt(encryptedText, hashedPassphrase);
  return bytes.toString(CryptoJS.enc.Utf8);
}

module.exports = {
  encryptText,
  decryptText
};
