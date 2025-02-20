import CryptoJS from "./crypto-js.min.js"; // Adjust the path if necessary

export function encryptText(text, passphrase) {
    return CryptoJS.AES.encrypt(text, passphrase).toString();
}

export function decryptText(encryptedText, passphrase) {
    try {
        let bytes = CryptoJS.AES.decrypt(encryptedText, passphrase);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error("Decryption failed:", error);
        return null;
    }
}

// OpenSSL-compatible AES decryption
export function decryptWithOpenSSL(encryptedText, passphrase) {
    try {
        let salt = CryptoJS.enc.Hex.parse("a1b2c3d4e5f6g7h8"); // Better to use a stored IV/salt
        let key = CryptoJS.PBKDF2(passphrase, salt, {
            keySize: 256 / 32,
            iterations: 1000
        });

        let decryptedBytes = CryptoJS.AES.decrypt(encryptedText, key, {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
            iv: salt
        });

        return decryptedBytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error("[ERROR] OpenSSL decryption failed:", error);
        return null;
    }
}

