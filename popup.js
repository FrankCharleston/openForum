// Ensure the popup UI loads correctly
document.addEventListener("DOMContentLoaded", function () {
    console.log("[INFO] OpenForum popup loaded.");

    // Encrypt Button
    document.getElementById("encryptBtn").addEventListener("click", function () {
        let message = document.getElementById("messageInput").value;
        let passphrase = document.getElementById("passphraseInput").value;

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

    // Decrypt Button
    document.getElementById("decryptBtn").addEventListener("click", function () {
        let encryptedMessage = document.getElementById("messageInput").value;
        let passphrase = document.getElementById("passphraseInput").value;

        if (!encryptedMessage.startsWith("ENC[")) {
            showError("Invalid encrypted message format.");
            return;
        }

        try {
            let encryptedData = encryptedMessage.replace("ENC[", "").replace("]", "");
            let decryptedText = decryptWithOpenSSL(encryptedData, passphrase);

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

    // Full Page Decryption Button
    document.getElementById("decryptPageBtn").addEventListener("click", function () {
        let passphrase = document.getElementById("globalPassphrase").value;

        if (!passphrase.trim()) {
            showError("Enter a passphrase for full-page decryption.");
            return;
        }

        let encryptedElements = document.querySelectorAll("body *:not(script):not(style)");

        encryptedElements.forEach(element => {
            if (element.textContent.includes("ENC[")) {
                let match = element.textContent.match(/ENC\[(.*?)\]/);
                if (match) {
                    let decryptedText = decryptWithOpenSSL(match[1], passphrase);
                    if (decryptedText) {
                        element.textContent = decryptedText;
                    }
                }
            }
        });

        showSuccess("Decryption completed on detected text.");
    });

    // Copy & Share Button
    document.getElementById("copyBtn").addEventListener("click", function () {
        let output = document.getElementById("output").value.trim();
        if (!output) {
            showError("Nothing to copy.");
            return;
        }

        let shareText = `${output}\n\n🔒 Encrypted using OpenForum: https://github.com/FrankCharleston/openForum`;
        navigator.clipboard.writeText(shareText)
            .then(() => showSuccess("Copied to clipboard!"))
            .catch(() => showError("Copy failed."));
    });

    // Helper functions
    function showError(message) {
        let log = document.getElementById("logs");
        log.innerHTML = `<span class="error">❌ ${message}</span>`;
    }

    function showSuccess(message) {
        let log = document.getElementById("logs");
        log.innerHTML = `<span class="success">✅ ${message}</span>`;
    }
});
