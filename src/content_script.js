document.addEventListener("DOMContentLoaded", function () {
    console.log("[INFO] OpenForum content script loaded.");

    // Load saved input on page load
    chrome.storage.local.get(["message", "passphrase", "decryptionEnabled"], (data) => {
        if (data.message) {
            document.getElementById("messageInput").value = data.message;
        }
        if (data.passphrase) {
            document.getElementById("passphraseInput").value = data.passphrase;
        }
        if (data.decryptionEnabled) {
            toggleDecryptionMode(true);
        }
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

    // Toggle decryption mode
    document.getElementById("toggleDecryption").addEventListener("click", function () {
        chrome.storage.local.get("decryptionEnabled", (data) => {
            let newState = !data.decryptionEnabled;
            chrome.storage.local.set({ decryptionEnabled: newState });
            toggleDecryptionMode(newState);
        });
    });

    function toggleDecryptionMode(state) {
        document.body.classList.toggle("decryption-active", state);
        document.getElementById("toggleDecryption").textContent = state ? "Disable Decryption" : "Enable Decryption";
    }

    function showError(message) {
        let log = document.getElementById("logs");
        log.innerHTML = `<span style="color:red;">[ERROR] ❌ ${message}</span>`;
    }

    function showSuccess(message) {
        let log = document.getElementById("logs");
        log.innerHTML = `<span style="color:green;">[SUCCESS] ✅ ${message}</span>`;
    }
});
