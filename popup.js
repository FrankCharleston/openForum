document.addEventListener("DOMContentLoaded", function () {
    const encryptBtn = document.getElementById("encryptBtn");
    const decryptBtn = document.getElementById("decryptBtn");
    const copyBtn = document.getElementById("copyBtn");
    const togglePassphraseBtn = document.getElementById("togglePassphrase");
    const passphraseInput = document.getElementById("passphrase");
    const textInput = document.getElementById("textInput");
    const output = document.getElementById("output");
    const statusMessage = document.getElementById("statusMessage");

    // ✅ Check if CryptoJS is Loaded
    if (typeof CryptoJS === "undefined") {
        console.error("❌ CryptoJS is not loaded!");
        showStatus("⚠️ Encryption library missing!", "error");
        return;
    }

    // ✅ Ensure the Passphrase Toggle Works
    if (togglePassphraseBtn) {
        togglePassphraseBtn.addEventListener("click", () => {
            passphraseInput.type = passphraseInput.type === "password" ? "text" : "password";
            togglePassphraseBtn.innerText = passphraseInput.type === "password" ? "👁" : "🙈";
        });
    }

    encryptBtn.addEventListener("click", () => processText("encrypt"));
    decryptBtn.addEventListener("click", () => processText("decrypt"));

    copyBtn.addEventListener("click", () => {
        if (!output.value.trim()) return;
        navigator.clipboard.writeText(output.value).then(() => {
            showStatus("📋 Copied to clipboard!", "success");
        }).catch(() => {
            showStatus("❌ Failed to copy.", "error");
        });
    });

    function processText(mode) {
        if (!textInput || !passphraseInput) {
            showStatus("⚠️ Missing input fields!", "error");
            return;
        }

        const text = textInput.value.trim();
        const passphrase = passphraseInput.value.trim();

        if (!text || !passphrase) {
            showStatus("⚠️ Enter text and passphrase.", "error");
            return;
        }

        output.value = mode === "encrypt" ? encryptText(text, passphrase) : decryptText(text, passphrase);
    }

    function encryptText(text, passphrase) {
        if (typeof CryptoJS === "undefined") {
            console.error("❌ CryptoJS is not available!");
            return "⚠️ Encryption error.";
        }
        return `ENC[${CryptoJS.AES.encrypt(text, passphrase).toString()}]`;
    }

    function decryptText(encryptedText, passphrase) {
        try {
            let bytes = CryptoJS.AES.decrypt(encryptedText.replace("ENC[", "").replace("]", ""), passphrase);
            return bytes.toString(CryptoJS.enc.Utf8) || "❌ Incorrect passphrase.";
        } catch (error) {
            return "⚠️ Decryption error.";
        }
    }

    function showStatus(message, type) {
        statusMessage.innerText = message;
        statusMessage.style.color = type === "success" ? "green" : "red";
        setTimeout(() => statusMessage.innerText = "", 2000);
    }
});
