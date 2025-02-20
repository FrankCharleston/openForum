document.addEventListener("DOMContentLoaded", function () {
    console.log("[INFO] OpenForum popup loaded.");

    document.getElementById("encryptBtn").addEventListener("click", function () {
        let message = document.getElementById("messageInput").value;
        let passphrase = document.getElementById("passphraseInput").value;

        if (!message.trim()) {
            showError("Enter a message to encrypt.");
            return;
        }

        try {
            let encrypted = window.encryptText(message, passphrase);
            document.getElementById("output").value = `ENC[${encrypted}]`;
            showSuccess("Message encrypted successfully!");
        } catch (error) {
            showError("Encryption failed.");
            console.error("[ERROR] Encryption error:", error);
        }
    });

    document.getElementById("decryptBtn").addEventListener("click", function () {
        let encryptedMessage = document.getElementById("messageInput").value;
        let passphrase = document.getElementById("passphraseInput").value;

        if (!encryptedMessage.startsWith("ENC[")) {
            showError("Invalid encrypted message format.");
            return;
        }

        try {
            let encryptedData = encryptedMessage.replace("ENC[", "").replace("]", "");
            let decryptedText = window.decryptText(encryptedData, passphrase);

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

    function showError(message) {
        let log = document.getElementById("logs");
        log.innerHTML = `<span class="error">❌ ${message}</span>`;
    }

    function showSuccess(message) {
        let log = document.getElementById("logs");
        log.innerHTML = `<span class="success">✅ ${message}</span>`;
    }
});
document.addEventListener("DOMContentLoaded", function () {
    console.log("[INFO] OpenForum popup loaded.");

    document.getElementById("encryptBtn").addEventListener("click", function () {
        let message = document.getElementById("messageInput").value;
        let passphrase = document.getElementById("passphraseInput").value;

        if (!message.trim()) {
            showError("Enter a message to encrypt.");
            return;
        }

        try {
            let encrypted = window.encryptText(message, passphrase);
            document.getElementById("output").value = `ENC[${encrypted}]`;
            showSuccess("Message encrypted successfully!");
        } catch (error) {
            showError("Encryption failed.");
            console.error("[ERROR] Encryption error:", error);
        }
    });

    document.getElementById("decryptBtn").addEventListener("click", function () {
        let encryptedMessage = document.getElementById("messageInput").value;
        let passphrase = document.getElementById("passphraseInput").value;

        if (!encryptedMessage.startsWith("ENC[")) {
            showError("Invalid encrypted message format.");
            return;
        }

        try {
            let encryptedData = encryptedMessage.replace("ENC[", "").replace("]", "");
            let decryptedText = window.decryptText(encryptedData, passphrase);

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

    function showError(message) {
        let log = document.getElementById("logs");
        log.innerHTML = `<span class="error">❌ ${message}</span>`;
    }

    function showSuccess(message) {
        let log = document.getElementById("logs");
        log.innerHTML = `<span class="success">✅ ${message}</span>`;
    }
});
