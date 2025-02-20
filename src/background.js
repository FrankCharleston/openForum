document.addEventListener("DOMContentLoaded", function () {
    console.log("[INFO] OpenForum popup loaded.");

    let messageInput = document.getElementById("messageInput");
    let passphraseInput = document.getElementById("passphraseInput");
    let outputField = document.getElementById("output");
    let encryptBtn = document.getElementById("encryptBtn");
    let decryptBtn = document.getElementById("decryptBtn");
    let toggleDecryptionBtn = document.getElementById("toggleDecryption");
    let logs = document.getElementById("logs");

    if (!messageInput || !passphraseInput || !outputField || !encryptBtn || !decryptBtn || !toggleDecryptionBtn || !logs) {
        console.error("[ERROR] One or more required elements are missing in popup.html.");
        return;
    }

    // Add event listeners safely
    encryptBtn.addEventListener("click", function () {
        let message = messageInput.value;
        let passphrase = passphraseInput.value || "default";

        if (!message.trim()) {
            showError("Enter a message to encrypt.");
            return;
        }

        try {
            let encrypted = CryptoJS.AES.encrypt(message, passphrase).toString();
            outputField.value = `ENC[${encrypted}]`;
            showSuccess("Message encrypted successfully!");
        } catch (error) {
            showError("Encryption failed.");
            console.error("[ERROR] Encryption error:", error);
        }
    });

    decryptBtn.addEventListener("click", function () {
        let encryptedMessage = messageInput.value;
        let passphrase = passphraseInput.value;

        if (!encryptedMessage.startsWith("ENC[")) {
            showError("Invalid encrypted message format.");
            return;
        }

        try {
            let encryptedData = encryptedMessage.replace("ENC[", "").replace("]", "");
            let decryptedBytes = CryptoJS.AES.decrypt(encryptedData, passphrase);
            let decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

            if (!decryptedText) throw new Error("Decryption failed.");

            outputField.value = decryptedText;
            showSuccess("Message decrypted successfully!");
        } catch (error) {
            showError("Decryption failed. Check your passphrase.");
            console.error("[ERROR] Decryption error:", error);
        }
    });

    function showError(message) {
        logs.innerHTML = `<span style="color:red;">[ERROR] ❌ ${message}</span>`;
    }

    function showSuccess(message) {
        logs.innerHTML = `<span style="color:green;">[SUCCESS] ✅ ${message}</span>`;
    }
});
