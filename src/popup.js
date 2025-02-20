document.addEventListener("scroll", function (event) {
    console.log("[INFO] Scrolling detected");
}, { passive: true });

document.addEventListener("touchstart", function (event) {
    console.log("[INFO] Touch detected");
}, { passive: true });

document.addEventListener("wheel", function (event) {
    console.log("[INFO] Mouse wheel used");
}, { passive: true });


document.addEventListener("DOMContentLoaded", function () {
    console.log("[INFO] OpenForum popup loaded.");

    // Get elements
    let messageInput = document.getElementById("messageInput");
    let passphraseInput = document.getElementById("passphraseInput");
    let outputField = document.getElementById("output");
    let encryptBtn = document.getElementById("encryptBtn");
    let decryptBtn = document.getElementById("decryptBtn");
    let copyBtn = document.getElementById("copyBtn");
    let toggleDecryptionBtn = document.getElementById("toggleDecryption");
    let logs = document.getElementById("logs");

    // Validate elements
    if (!messageInput || !passphraseInput || !outputField || !encryptBtn || !decryptBtn || !copyBtn || !toggleDecryptionBtn || !logs) {
        console.error("[ERROR] One or more required elements are missing in popup.html.");
        return;
    }

    // Load stored values
    chrome.storage.local.get(["message", "passphrase"], (data) => {
        messageInput.value = data.message || "";
        passphraseInput.value = data.passphrase || "";
    });

    // Save inputs
    messageInput.addEventListener("input", (event) => chrome.storage.local.set({ message: event.target.value }));
    passphraseInput.addEventListener("input", (event) => chrome.storage.local.set({ passphrase: event.target.value }));

    // Encrypt
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
            chrome.storage.local.set({ message: `ENC[${encrypted}]` });
            showSuccess("Message encrypted successfully!");
        } catch (error) {
            showError("Encryption failed.");
            console.error("[ERROR] Encryption error:", error);
        }
    });

    // Decrypt
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

    // Copy Output
    copyBtn.addEventListener("click", function () {
        navigator.clipboard.writeText(outputField.value).then(() => {
            showSuccess("Copied to clipboard!");
        }).catch(() => {
            showError("Failed to copy.");
        });
    });

    // Toggle Decryption Mode
    toggleDecryptionBtn.addEventListener("click", function () {
        chrome.storage.local.get("decryptionEnabled", (data) => {
            let newState = !data.decryptionEnabled;
            chrome.storage.local.set({ decryptionEnabled: newState }, () => {
                showSuccess(newState ? "Decryption Enabled!" : "Decryption Disabled!");
            });
        });
    });

    function showError(message) {
        logs.innerHTML = `<span style="color:red;">[ERROR] ❌ ${message}</span>`;
    }

    function showSuccess(message) {
        logs.innerHTML = `<span style="color:green;">[SUCCESS] ✅ ${message}</span>`;
    }
});
