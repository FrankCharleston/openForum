document.addEventListener("DOMContentLoaded", function () {
    console.log("[INFO] OpenForum popup loaded.");

    /**
     * Load saved input on popup open
     * This keeps message & passphrase fields persistent
     */
    chrome.storage.local.get(["message", "passphrase"], (data) => {
        if (data.message) document.getElementById("messageInput").value = data.message;
        if (data.passphrase) document.getElementById("passphraseInput").value = data.passphrase;
    });

    // Store input field values persistently
    document.getElementById("messageInput").addEventListener("input", (event) => {
        chrome.storage.local.set({ message: event.target.value });
    });
    document.getElementById("passphraseInput").addEventListener("input", (event) => {
        chrome.storage.local.set({ passphrase: event.target.value });
    });

    // Encrypt button functionality
    document.getElementById("encryptBtn").addEventListener("click", function () {
        let message = document.getElementById("messageInput").value;
        let passphrase = document.getElementById("passphraseInput").value || "default";

        if (!message.trim()) {
            showError("Enter a message to encrypt.");
            return;
        }

        try {
            let encrypted = CryptoJS.AES.encrypt(message, passphrase).toString();
            document.getElementById("output").value = `ENC[${encrypted}]`;
            showSuccess("Message encrypted successfully!");
        } catch (error) {
            showError("Encryption failed.");
            console.error("[ERROR] Encryption error:", error);
        }
    });

    // Decrypt button functionality
    document.getElementById("decryptBtn").addEventListener("click", function () {
        let encryptedMessage = document.getElementById("messageInput").value.trim();
        let passphrase = document.getElementById("passphraseInput").value.trim();
    
        if (!encryptedMessage.startsWith("ENC[")) {
            showError("Invalid encrypted message format. Expected ENC[...].");
            return;
        }
    
        try {
            // Extract the actual encrypted text
            let encryptedData = encryptedMessage.slice(4, -1); // Removes "ENC[" and "]"
    
            // Attempt decryption
            let decryptedBytes = CryptoJS.AES.decrypt(encryptedData, passphrase);
            let decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
    
            if (!decryptedText) {
                throw new Error("Empty decryption result, likely due to wrong passphrase.");
            }
    
            document.getElementById("output").value = decryptedText;
            showSuccess("Message decrypted successfully!");
        } catch (error) {
            showError("Decryption failed: Invalid passphrase or corrupted data.");
            console.error("[ERROR] Decryption error:", error);
        }
        console.log("Encrypted Data:", encryptedData);
        console.log("Decryption Key (passphrase):", passphrase);
    });    

    // Copy to clipboard with link back to repo
    document.getElementById("copyBtn").addEventListener("click", function () {
        let output = document.getElementById("output").value;
        if (!output.trim()) {
            showError("Nothing to copy.");
            return;
        }
    
        let shareText = `${output}\n\n🔒 Encrypted using OpenForum: https://github.com/FrankCharleston/openForum`;
        navigator.clipboard.writeText(shareText)
            .then(() => showSuccess("Copied to clipboard!"))
            .catch(() => showError("Copy failed."));
    });
    

    // Decrypt entire page function
    document.getElementById("decryptBtn").addEventListener("click", function () {
        let encryptedMessage = document.getElementById("messageInput").value.trim();
        let passphrase = document.getElementById("passphraseInput").value.trim();
    
        if (!encryptedMessage.startsWith("ENC[")) {
            showError("Invalid encrypted message format.");
            return;
        }
    
        try {
            // Extract base64 encoded data, ensuring brackets are removed
            let extractedData = encryptedMessage.match(/ENC\[(.+)\]/);
            if (!extractedData || extractedData.length < 2) {
                throw new Error("Malformed encrypted message format.");
            }
            
            let encryptedData = extractedData[1]; // Extract actual ciphertext
            let rawCiphertext = CryptoJS.enc.Base64.parse(encryptedData);
            
            if (!rawCiphertext || rawCiphertext.sigBytes < 16) {
                throw new Error("Invalid ciphertext. Possibly corrupted or incomplete.");
            }
    
            // Extract IV (first 16 bytes)
            let iv = CryptoJS.lib.WordArray.create(rawCiphertext.words.slice(0, 4));
            let actualCiphertext = CryptoJS.lib.WordArray.create(rawCiphertext.words.slice(4));
    
            // Log values for debugging
            console.log("Extracted Encrypted Data:", encryptedData);
            console.log("Extracted IV:", iv.toString());
            console.log("Actual Ciphertext:", actualCiphertext.toString());
    
            // Generate Key using PBKDF2 (simulating OpenSSL behavior)
            let key = CryptoJS.PBKDF2(passphrase, CryptoJS.enc.Utf8.parse("salt"), {
                keySize: 256 / 32, // 256-bit key
                iterations: 10000,
            });
    
            // Decrypt using the extracted IV and derived key
            let decryptedBytes = CryptoJS.AES.decrypt(
                { ciphertext: actualCiphertext },
                key,
                { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
            );
    
            let decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
    
            if (!decryptedText) {
                throw new Error("Invalid passphrase or corrupted data.");
            }
    
            document.getElementById("output").value = decryptedText;
            showSuccess("Message decrypted successfully!");
        } catch (error) {
            showError("Decryption failed: " + error.message);
            console.error("[ERROR] Decryption error:", error);
        }
    });    

    /**
     * Show an error message in the UI
     */
    function showError(message) {
        let log = document.getElementById("logs");
        log.innerHTML = `<span class="error">❌ ${message}</span>`;
        setTimeout(() => log.innerHTML = "", 4000);
    }

    /**
     * Show a success message in the UI
     */
    function showSuccess(message) {
        let log = document.getElementById("logs");
        log.innerHTML = `<span class="success">✅ ${message}</span>`;
        setTimeout(() => log.innerHTML = "", 4000);
    }
});
