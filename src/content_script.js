(() => {
    console.log("[INFO] OpenForum content script loaded.");

    // Retrieve and store decryption settings
    chrome.storage.local.get("decryptionEnabled", (data) => {
        if (data.decryptionEnabled) {
            decryptPageContent();
        }
    });
    

    function decryptWithIV(encryptedData, passphrase) {
        try {
            console.log("[DEBUG] Raw encrypted input:", encryptedData);
            
            if (!encryptedData.startsWith("ENC[")) {
                throw new Error("Invalid encrypted message format.");
            }
    
            // Clean input
            encryptedData = encryptedData.replace("ENC[", "").replace("]", "").trim();
            
            console.log("[DEBUG] Cleaned encrypted data:", encryptedData);
            
            // Decode Base64
            let rawData = CryptoJS.enc.Base64.parse(encryptedData);
            
            console.log("[DEBUG] Raw data length:", rawData.sigBytes);
    
            if (rawData.sigBytes < 16) {
                throw new Error("Encrypted data too short, missing IV.");
            }
    
            // Extract IV (first 16 bytes)
            let iv = CryptoJS.lib.WordArray.create(rawData.words.slice(0, 4));
            let encryptedText = CryptoJS.lib.WordArray.create(rawData.words.slice(4));
    
            console.log("[DEBUG] Extracted IV:", iv.toString());
            console.log("[DEBUG] Encrypted message:", encryptedText.toString());
    
            // Key derivation (must match OpenSSL `-pbkdf2`)
            let key = CryptoJS.PBKDF2(passphrase, iv, { keySize: 256 / 32, iterations: 1000 });
    
            console.log("[DEBUG] Derived key:", key.toString());
    
            // Decrypt
            let decryptedBytes = CryptoJS.AES.decrypt(
                { ciphertext: encryptedText },
                key,
                { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
            );
    
            let decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
    
            if (!decryptedText) {
                throw new Error("Decryption failed. Check passphrase.");
            }
    
            console.log("[SUCCESS] Decrypted text:", decryptedText);
            return decryptedText;
        } catch (error) {
            console.error("[ERROR] Decryption failed:", error);
            return null;
        }
    }
    

    // Function to scan and decrypt encrypted content on a webpage
    function decryptPageContent() {
        let elements = document.querySelectorAll("p, span, div");

        elements.forEach((element) => {
            let text = element.innerText;
            if (text.startsWith("ENC[")) {
                let encryptedText = text.replace("ENC[", "").replace("]", "");
                
                chrome.storage.local.get("passphrase", (data) => {
                    let passphrase = data.passphrase || "default";
                    try {
                        let decryptedBytes = CryptoJS.AES.decrypt(encryptedText, passphrase);
                        let decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

                        if (decryptedText) {
                            element.innerText = decryptedText;
                        }
                    } catch (error) {
                        console.warn("[WARN] Decryption failed for:", text);
                    }
                });
            }
        });
    }
})();
