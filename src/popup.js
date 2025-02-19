document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("encryptBtn").addEventListener("click", encryptMessage);
    document.getElementById("decryptBtn").addEventListener("click", decryptMessage);
    document.getElementById("decryptPageBtn").addEventListener("click", decryptPage);
});

function encryptMessage() {
    let text = document.getElementById("encryptInput").value;
    let passphrase = document.getElementById("passphrase").value || "defaultpassword";

    try {
        let encrypted = CryptoJS.AES.encrypt(text, passphrase).toString();
        document.getElementById("output").innerText = `ENC[${encrypted}]`;
    } catch (error) {
        document.getElementById("output").innerText = "❌ Encryption failed.";
    }
}

function decryptMessage() {
    let encryptedText = document.getElementById("decryptInput").value;
    let passphrase = document.getElementById("passphrase").value || "defaultpassword";

    try {
        let decrypted = CryptoJS.AES.decrypt(encryptedText.replace("ENC[", "").replace("]", ""), passphrase).toString(CryptoJS.enc.Utf8);
        if (!decrypted) throw new Error("Invalid passphrase.");
        document.getElementById("output").innerText = `✅ Decrypted: ${decrypted}`;
    } catch (error) {
        document.getElementById("output").innerText = "❌ Decryption failed.";
    }
}

function decryptPage() {
    let passphrase = document.getElementById("passphrase").value || "defaultpassword";
    chrome.runtime.sendMessage({ action: "decryptPage", passphrase });
}
