document.addEventListener("DOMContentLoaded", function () {
    console.log("[INFO] OpenForum extension loaded.");

    document.getElementById("encryptBtn").addEventListener("click", () => {
        let message = document.getElementById("messageInput").value.trim();
        let passphrase = document.getElementById("passphraseInput").value.trim() || "default";
        let outputField = document.getElementById("output");

        if (!message) {
            showError("Enter a message to encrypt.");
            return;
        }

        try {
            let encrypted = encryptMessage(message, passphrase);
            outputField.value = `ENC[${encrypted}]`;
            showSuccess("Message encrypted successfully!");
            console.log("[INFO] Encryption successful.");
        } catch (error) {
            showError("Encryption failed.");
            console.error("[ERROR] Encryption error:", error);
        }
    });

    document.getElementById("decryptBtn").addEventListener("click", () => {
        let encryptedMessage = document.getElementById("messageInput").value.trim();
        let passphrase = document.getElementById("passphraseInput").value.trim() || "default";
        let outputField = document.getElementById("output");

        if (!encryptedMessage.startsWith("ENC[")) {
            showError("Invalid encrypted message format.");
            return;
        }

        try {
            let decrypted = decryptOpenSSL(encryptedMessage, passphrase);
            if (!decrypted) throw new Error("Decryption returned empty result.");
            outputField.value = decrypted;
            showSuccess("Message decrypted successfully!");
            console.log("[INFO] Decryption successful.");
        } catch (error) {
            showError("Decryption failed. Check passphrase.");
            console.error("[ERROR] Decryption error:", error);
        }
    });

    document.getElementById("copyBtn").addEventListener("click", () => {
        let outputText = document.getElementById("output").value;
        if (!outputText) {
            showError("Nothing to copy.");
            return;
        }

        navigator.clipboard.writeText(outputText).then(() => {
            showSuccess("Copied to clipboard.");
            console.log("[INFO] Copied to clipboard:", outputText);
        }).catch((error) => {
            showError("Failed to copy.");
            console.error("[ERROR] Clipboard copy failed:", error);
        });
    });

    document.getElementById("decryptPageBtn").addEventListener("click", () => {
        let passphrase = document.getElementById("passphraseInput").value.trim() || "default";
        console.log("[INFO] Decrypting page with passphrase:", passphrase);

        chrome.runtime.sendMessage({ action: "decryptPage", passphrase: passphrase }, (response) => {
            if (chrome.runtime.lastError) {
                showError("Error sending request.");
                console.error("[ERROR] Decrypt Page request error:", chrome.runtime.lastError);
            } else {
                showSuccess(response.message || "Page decryption attempted.");
                console.log("[INFO] Decrypt Page response:", response);
            }
        });
    });
});

function encryptMessage(message, passphrase) {
    try {
        let encrypted = CryptoJS.AES.encrypt(message, passphrase).toString();
        console.log("[DEBUG] Encrypted message:", encrypted);
        return encrypted;
    } catch (error) {
        console.error("[ERROR] Encryption failed:", error);
        throw error;
    }
}

function decryptOpenSSL(encryptedText, passphrase) {
    try {
        if (!encryptedText.startsWith("ENC[U2FsdGVk")) {
            console.warn("[WARN] Invalid encrypted message format.");
            throw new Error("Invalid encrypted message format.");
        }

        let ciphertext = atob(encryptedText.replace(/ENC\[|\]/g, ""));
        let saltedPrefix = "Salted__";
        let saltedBytes = new TextEncoder().encode(saltedPrefix);
        let saltedLength = saltedBytes.length;

        let dataBytes = new Uint8Array(ciphertext.length);
        for (let i = 0; i < ciphertext.length; i++) {
            dataBytes[i] = ciphertext.charCodeAt(i);
        }

        let salt = dataBytes.slice(saltedLength, saltedLength + 8);
        let encryptedBytes = dataBytes.slice(saltedLength + 8);

        let keyIV = CryptoJS.PBKDF2(passphrase, CryptoJS.lib.WordArray.create(salt), {
            keySize: (32 + 16) / 4,
            iterations: 10000,
            hasher: CryptoJS.algo.SHA256
        });

        let key = CryptoJS.lib.WordArray.create(keyIV.words.slice(0, 8));
        let iv = CryptoJS.lib.WordArray.create(keyIV.words.slice(8, 12));

        let decrypted = CryptoJS.AES.decrypt(
            { ciphertext: CryptoJS.lib.WordArray.create(encryptedBytes) },
            key,
            { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
        );

        let plaintext = decrypted.toString(CryptoJS.enc.Utf8);
        if (!plaintext) throw new Error("Decryption failed. Check passphrase.");
        console.log("[INFO] Decryption successful:", plaintext);
        return plaintext;
    } catch (error) {
        console.error("[ERROR] OpenSSL decryption failed:", error);
        throw error;
    }
}

// UI Feedback Functions
function showSuccess(message) {
    let logBox = document.getElementById("logBox");
    logBox.innerHTML = `<p style="color:green;">✅ ${message}</p>`;
}

function showError(message) {
    let logBox = document.getElementById("logBox");
    logBox.innerHTML = `<p style="color:red;">❌ ${message}</p>`;
}
