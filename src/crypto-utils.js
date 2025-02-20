/**
 * OpenForum Crypto Utilities
 * ===========================
 * This file contains helper functions for encryption and decryption
 * using CryptoJS to maintain compatibility with OpenSSL.
 */

/**
 * Decrypts an AES-256-CBC encrypted message using a passphrase.
 * This function ensures compatibility with OpenSSL by using PBKDF2-derived keys
 * and a fixed IV (Initialization Vector).
 *
 * @param {string} encryptedText - The base64-encoded encrypted message.
 * @param {string} passphrase - The passphrase for decryption.
 * @returns {string} - The decrypted plaintext message.
 */
function decryptWithOpenSSL(encryptedText, passphrase) {
    try {
        // Derive a 256-bit key from the passphrase using PBKDF2
        let key = CryptoJS.PBKDF2(passphrase, CryptoJS.enc.Hex.parse("0000000000000000"), {
            keySize: 256 / 32,  // 32-byte (256-bit) key
            iterations: 1000     // Standard PBKDF2 iterations
        });

        // Perform AES decryption
        let decryptedBytes = CryptoJS.AES.decrypt(encryptedText, key, {
            mode: CryptoJS.mode.CBC,                // AES CBC mode
            padding: CryptoJS.pad.Pkcs7,            // PKCS7 padding
            iv: CryptoJS.enc.Hex.parse("0000000000000000")  // Fixed IV (ensure OpenSSL compatibility)
        });

        // Convert decrypted bytes back to a UTF-8 string
        let decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

        // Ensure decryption was successful
        if (!decryptedText) throw new Error("Decryption failed. Invalid passphrase or corrupted data.");

        return decryptedText;

    } catch (error) {
        console.error("[ERROR] Decryption error:", error);
        return "Decryption error: " + error.message;
    }
}

/**
 * Example Usage:
 * console.log(decryptWithOpenSSL("U2FsdGVkX...", "mypassword"));
 */
