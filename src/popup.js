// ✅ Load CryptoJS
importScripts("crypto-js.min.js");

// ✅ Ensure the script is loaded
console.log("[DEBUG] Popup script initialized.");

document.getElementById("encryptBtn").addEventListener("click", () => {
    try {
        const text = document.getElementById("inputText").value;
        if (!text) return;

        let passphrase = prompt("Enter encryption passphrase:", "mypassword");
        if (!passphrase) return;

        const encryptedText = CryptoJS.AES.encrypt(text, passphrase).toString();
        document.getElementById("inputText").value = `ENC[${encryptedText}]`;
        logMessage("[INFO] ✅ Encrypted message successfully.");
    } catch (error) {
        console.error("[ERROR] Encryption failed:", error);
        logMessage("[ERROR] ❌ Encryption failed.", "error");
    }
});

document.addEventListener("DOMContentLoaded", function () {
    console.log("[INFO] OpenForum popup loaded.");

    // Load saved input
    chrome.storage.local.get(["message", "passphrase"], (data) => {
        document.getElementById("messageInput").value = data.message || "";
        document.getElementById("passphraseInput").value = data.passphrase || "";
    });

    // Save message input changes
    document.getElementById("messageInput").addEventListener("input", (event) => {
        chrome.storage.local.set({ message: event.target.value });
    });

    // Save passphrase input changes
    document.getElementById("passphraseInput").addEventListener("input", (event) => {
        chrome.storage.local.set({ passphrase: event.target.value });
    });

    // Handle Encryption
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
            chrome.storage.local.set({ message: `ENC[${encrypted}]` });
            showSuccess("Message encrypted successfully!");
        } catch (error) {
            showError("Encryption failed.");
            console.error("[ERROR] Encryption error:", error);
        }
    });

    // Handle Decryption
    document.getElementById("decryptBtn").addEventListener("click", function () {
        let encryptedMessage = document.getElementById("messageInput").value;
        let passphrase = document.getElementById("passphraseInput").value;

        if (!encryptedMessage.startsWith("ENC[")) {
            showError("Invalid encrypted message format.");
            return;
        }

        try {
            let encryptedData = encryptedMessage.replace("ENC[", "").replace("]", "");
            let decryptedBytes = CryptoJS.AES.decrypt(encryptedData, passphrase);
            let decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

            if (!decryptedText) {
                throw new Error("Decryption failed.");
            }

            document.getElementById("output").value = decryptedText;
            showSuccess("Message decrypted successfully!");
        } catch (error) {
            showError("Decryption failed. Check your passphrase.");
            console.error("[ERROR] Decryption error:", error);
        }
    });

    // Toggle Decryption Mode
    document.getElementById("toggleDecryption").addEventListener("click", function () {
        chrome.storage.local.get("decryptionEnabled", (data) => {
            let newState = !data.decryptionEnabled;
            chrome.storage.local.set({ decryptionEnabled: newState }, () => {
                showSuccess(newState ? "Decryption Enabled!" : "Decryption Disabled!");
            });
        });
    });

    function showError(message) {
        let log = document.getElementById("logs");
        log.innerHTML = `<span style="color:red;">[ERROR] ❌ ${message}</span>`;
    }

    function logMessage(msg, type = "log") {
        const logContainer = document.getElementById("logContainer");
        logContainer.innerHTML += `<div class="${type}">${msg}</div>`;
    }

    function showSuccess(message) {
        let log = document.getElementById("logs");
        log.innerHTML = `<span style="color:green;">[SUCCESS] ✅ ${message}</span>`;
    }
});
