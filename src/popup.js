document.getElementById("encryptBtn").addEventListener("click", () => {
    let message = document.getElementById("messageInput").value;
    let passphrase = document.getElementById("passphraseInput").value || "default";

    if (!message.trim()) {
        alert("Enter a message to encrypt.");
        return;
    }

    let encrypted = CryptoJS.AES.encrypt(message, passphrase).toString();
    document.getElementById("output").value = `ENC[${encrypted}]`;
});

document.getElementById("decryptBtn").addEventListener("click", () => {
    let encryptedMessage = document.getElementById("messageInput").value;
    let passphrase = document.getElementById("passphraseInput").value || "default";

    if (!encryptedMessage.startsWith("ENC[")) {
        alert("Invalid encrypted message format.");
        return;
    }

    let encryptedText = encryptedMessage.replace(/^ENC\[(.+)\]$/, "$1");
    let bytes = CryptoJS.AES.decrypt(encryptedText, passphrase);
    let decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
        alert("Failed to decrypt. Check your passphrase.");
        return;
    }

    document.getElementById("output").value = decrypted;
});

document.getElementById("copyBtn").addEventListener("click", () => {
    let output = document.getElementById("output").value;
    if (!output.trim()) return;
    navigator.clipboard.writeText(output);
    alert("Copied to clipboard!");
});

document.getElementById("decryptPageBtn").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "decryptPage" });
});
