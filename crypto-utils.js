// OpenSSL-compatible AES decryption
window.decryptWithOpenSSL = function (encryptedText, passphrase) {
    try {
        let key = CryptoJS.PBKDF2(passphrase, CryptoJS.enc.Hex.parse("0000000000000000"), {
            keySize: 256 / 32,
            iterations: 1000
        });

        let decryptedBytes = CryptoJS.AES.decrypt(encryptedText, key, {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
            iv: CryptoJS.enc.Hex.parse("0000000000000000")
        });

        return decryptedBytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error("[ERROR] OpenSSL decryption failed:", error);
        return null;
    }
};
