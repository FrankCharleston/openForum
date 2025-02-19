// ✅ Load CryptoJS
importScripts("crypto-js.min.js");

// ✅ Ensure the script is loaded
console.log("[DEBUG] Popup script initialized.");

document.getElementById("encryptBtn").addEventListener("click", () => {
    try {
        const text = document.getElementById("inputText").value;
        if (!text) return;

        let passphrase = prompt("Enter encryption passphrase:", "mypassword");
        if (!passphrase) return;

        const encryptedText = CryptoJS.AES.encrypt(text, passphrase).toString();
        document.getElementById("inputText").value = `ENC[${encryptedText}]`;
        logMessage("[INFO] ✅ Encrypted message successfully.");
    } catch (error) {
        console.error("[ERROR] Encryption failed:", error);
        logMessage("[ERROR] ❌ Encryption failed.", "error");
    }
});

document.getElementById("decryptBtn").addEventListener("click", () => {
    try {
        const text = document.getElementById("inputText").value.replace(/ENC\[|\]/g, "");
        if (!text) return;

        let passphrase = prompt("Enter decryption passphrase:", "mypassword");
        if (!passphrase) return;

        const decrypted = CryptoJS.AES.decrypt(text, passphrase).toString(CryptoJS.enc.Utf8);
        if (!decrypted) throw new Error("Decryption failed");

        document.getElementById("inputText").value = decrypted;
        logMessage("[INFO] ✅ Decryption successful.");
    } catch (error) {
        console.error("[ERROR] Decryption failed:", error);
        logMessage("[ERROR] ❌ Decryption failed. Check your passphrase.", "error");
    }
});

function logMessage(msg, type = "log") {
    const logContainer = document.getElementById("logContainer");
    logContainer.innerHTML += `<div class="${type}">${msg}</div>`;
}
