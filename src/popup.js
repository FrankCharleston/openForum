document.addEventListener("DOMContentLoaded", function () {
    console.log("[INFO] OpenForum popup loaded.");

    // Load saved input on page load
    chrome.storage.local.get(["message", "passphrase"], (data) => {
        if (data.message) document.getElementById("messageInput").value = data.message;
        if (data.passphrase) document.getElementById("passphraseInput").value = data.passphrase;
    });

    // Save input field changes
    document.getElementById("messageInput").addEventListener("input", (event) => {
        chrome.storage.local.set({ message: event.target.value });
    });
    document.getElementById("passphraseInput").addEventListener("input", (event) => {
        chrome.storage.local.set({ passphrase: event.target.value });
    });

    // Encrypt message
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

    // Decrypt message
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

    // Copy to clipboard
    document.getElementById("copyBtn").addEventListener("click", function () {
        let output = document.getElementById("output").value;
        if (!output) {
            showError("Nothing to copy.");
            return;
        }

        navigator.clipboard.writeText(output)
            .then(() => showSuccess("Copied to clipboard!"))
            .catch(err => showError("Copy failed."));
    });

    // Decrypt entire page
    document.getElementById("decryptPageBtn").addEventListener("click", function () {
        let passphrase = document.getElementById("globalPassphrase").value;

        if (!passphrase.trim()) {
            showError("Enter a passphrase for full-page decryption.");
            return;
        }

        chrome.scripting.executeScript({
            target: { allFrames: true },
            func: (passphrase) => {
                let elements = document.querySelectorAll("*:not(script):not(style)");
                elements.forEach(el => {
                    if (el.textContent.includes("ENC[")) {
                        try {
                            let encryptedData = el.textContent.match(/ENC\[(.*?)\]/)[1];
                            let decryptedBytes = CryptoJS.AES.decrypt(encryptedData, passphrase);
                            let decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
                            if (decryptedText) el.textContent = decryptedText;
                        } catch (e) {
                            console.error("[ERROR] Failed to decrypt element:", el);
                        }
                    }
                });
            },
            args: [passphrase]
        });
    });

    function showError(message) {
        let log = document.getElementById("logs");
        log.innerHTML = `<span class="error">❌ ${message}</span>`;
        setTimeout(() => log.innerHTML = "", 4000);
    }

    function showSuccess(message) {
        let log = document.getElementById("logs");
        log.innerHTML = `<span class="success">✅ ${message}</span>`;
        setTimeout(() => log.innerHTML = "", 4000);
    }
});
