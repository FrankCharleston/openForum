function decryptOpenSSL(encryptedText, passphrase) {
    try {
        if (!encryptedText.startsWith("ENC[U2FsdGVk")) {
            alert("Invalid encrypted message format.");
            return;
        }

        let ciphertext = atob(encryptedText.replace(/ENC\[|\]/g, "")); // Decode Base64
        let saltedPrefix = "Salted__"; // OpenSSL prefix
        let saltedBytes = new TextEncoder().encode(saltedPrefix);
        let saltedLength = saltedBytes.length;

        let dataBytes = new Uint8Array(ciphertext.length);
        for (let i = 0; i < ciphertext.length; i++) {
            dataBytes[i] = ciphertext.charCodeAt(i);
        }

        // Extract salt
        let salt = dataBytes.slice(saltedLength, saltedLength + 8);
        let encryptedBytes = dataBytes.slice(saltedLength + 8);

        // Derive key & IV
        let keyIV = CryptoJS.PBKDF2(passphrase, CryptoJS.lib.WordArray.create(salt), {
            keySize: (32 + 16) / 4, // 256-bit key + 128-bit IV
            iterations: 10000,
            hasher: CryptoJS.algo.SHA256
        });

        let key = CryptoJS.lib.WordArray.create(keyIV.words.slice(0, 8));
        let iv = CryptoJS.lib.WordArray.create(keyIV.words.slice(8, 12));

        // Decrypt
        let decrypted = CryptoJS.AES.decrypt(
            { ciphertext: CryptoJS.lib.WordArray.create(encryptedBytes) },
            key,
            { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
        );

        let plaintext = decrypted.toString(CryptoJS.enc.Utf8);
        if (!plaintext) throw new Error("Decryption failed. Check passphrase.");
        return plaintext;
    } catch (error) {
        console.error("[ERROR] OpenSSL decryption failed:", error);
        alert("Decryption failed. Ensure you're using the correct passphrase and format.");
    }
}
