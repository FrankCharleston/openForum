importScripts("crypto-js.min.js");

// Create context menu for encryption and decryption
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "encryptSelectedText",
        title: "Encrypt Selected Text",
        contexts: ["selection"]
    });

    chrome.contextMenus.create({
        id: "decryptSelectedText",
        title: "Decrypt Selected Text",
        contexts: ["selection"]
    });
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "encryptSelectedText") {
        encryptSelectedText(info.selectionText);
    } else if (info.menuItemId === "decryptSelectedText") {
        decryptSelectedText(info.selectionText);
    }
});

// Encrypt selected text
function encryptSelectedText(text) {
    let passphrase = prompt("Enter passphrase to encrypt:");
    if (!passphrase) return;

    try {
        let encrypted = CryptoJS.AES.encrypt(text, passphrase).toString();
        let formatted = `ENC[${encrypted}]`;
        navigator.clipboard.writeText(formatted).then(() => {
            alert("Encrypted text copied to clipboard.");
        });
    } catch (error) {
        console.error("[ERROR] Encryption failed:", error);
        alert("Encryption failed.");
    }
}

// Decrypt selected text
function decryptSelectedText(encryptedText) {
    let passphrase = prompt("Enter passphrase to decrypt:");
    if (!passphrase) return;

    try {
        let cleaned = encryptedText.replace(/^ENC\[(.*)\]$/, "$1");
        let bytes = CryptoJS.AES.decrypt(cleaned, passphrase);
        let decrypted = bytes.toString(CryptoJS.enc.Utf8);

        if (decrypted) {
            alert("Decrypted Message: " + decrypted);
            navigator.clipboard.writeText(decrypted);
        } else {
            throw new Error("Incorrect passphrase or corrupted text.");
        }
    } catch (error) {
        console.error("[ERROR] Decryption failed:", error);
        alert("Decryption failed. Check your passphrase.");
    }
}
