document.addEventListener("DOMContentLoaded", function () {
    const encryptBtn = document.getElementById("encryptBtn");
    const decryptBtn = document.getElementById("decryptBtn");
    const copyBtn = document.getElementById("copyBtn");
    const togglePassphraseBtn = document.getElementById("togglePassphrase");
    const passphraseInput = document.getElementById("passphraseInput");
    const messageInput = document.getElementById("messageInput");
    const output = document.getElementById("output");
    const statusMessage = document.getElementById("statusMessage");

    togglePassphraseBtn.addEventListener("click", () => {
        passphraseInput.type = passphraseInput.type === "password" ? "text" : "password";
        togglePassphraseBtn.innerText = passphraseInput.type === "password" ? "👁️ Show" : "👁️ Hide";
    });

    encryptBtn.addEventListener("click", function () {
        let message = messageInput.value.trim();
        let passphrase = passphraseInput.value.trim();

        if (!message || !passphrase) {
            showStatus("⚠️ Enter a message and passphrase!", "error");
            return;
        }

        let encrypted = CryptoJS.AES.encrypt(message, passphrase).toString();
        let formattedMessage = `ENC[${encrypted}]\n\n🔐 This message is securely encrypted using OpenForum. Join the discussion securely!`;

        output.value = formattedMessage;
        showStatus("✅ Encrypted successfully!", "success");
    });

    decryptBtn.addEventListener("click", function () {
        let encryptedMessage = messageInput.value.trim();
        let passphrase = passphraseInput.value.trim();

        if (!encryptedMessage.startsWith("ENC[") || !passphrase) {
            showStatus("⚠️ Invalid encrypted message or missing passphrase.", "error");
            return;
        }

        let encryptedData = encryptedMessage.replace("ENC[", "").replace("]", "").trim();
        let bytes = CryptoJS.AES.decrypt(encryptedData, passphrase);
        let decrypted = bytes.toString(CryptoJS.enc.Utf8);

        if (decrypted) {
            output.value = decrypted;
            showStatus("✅ Decryption successful!", "success");
        } else {
            showStatus("❌ Decryption failed. Check passphrase.", "error");
        }
    });

    copyBtn.addEventListener("click", function () {
        navigator.clipboard.writeText(output.value).then(() => {
            showStatus("📋 Copied to clipboard!", "success");
        }).catch(() => {
            showStatus("❌ Copy failed.", "error");
        });
    });

    function showStatus(message, type) {
        statusMessage.innerText = message;
        statusMessage.style.color = type === "success" ? "#4CAF50" : "#FF9800";
    }
});
