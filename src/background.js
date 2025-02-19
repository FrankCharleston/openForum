// ✅ Load CryptoJS
importScripts("crypto-js.min.js");

// ✅ Background script initialization
console.log("[DEBUG] Background script loaded.");

// Create context menu options on install
chrome.runtime.onInstalled.addListener(() => {
    console.log("[DEBUG] Installing context menu items...");
    chrome.contextMenus.create({ id: "encryptMessage", title: "Encrypt Message", contexts: ["selection"] });
    chrome.contextMenus.create({ id: "decryptMessage", title: "Decrypt Message", contexts: ["selection"] });
    chrome.contextMenus.create({ id: "decryptClipboard", title: "Decrypt Clipboard", contexts: ["all"] });
});

// Handle right-click context menu actions
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    try {
        if (info.menuItemId === "encryptMessage") {
            handleEncryption(info.selectionText);
        } else if (info.menuItemId === "decryptMessage") {
            handleDecryption(info.selectionText);
        } else if (info.menuItemId === "decryptClipboard") {
            const clipboardText = await navigator.clipboard.readText();
            if (!clipboardText.startsWith("ENC[")) {
                alert("No encrypted message detected in clipboard.");
                return;
            }
            handleDecryption(clipboardText.replace(/ENC\[|\]/g, ""));
        }
    } catch (error) {
        console.error("[ERROR] Context menu action failed:", error);
    }
});

// Encrypt selected text
function handleEncryption(text) {
    if (!text) return;
    let passphrase = prompt("Enter encryption passphrase:", "mypassword");
    if (!passphrase) return;

    const encryptedText = CryptoJS.AES.encrypt(text, passphrase).toString();
    navigator.clipboard.writeText(`ENC[${encryptedText}]`).then(() => {
        console.log("[DEBUG] Encrypted text copied to clipboard.");
        alert("Encrypted text copied to clipboard.");
    }).catch(error => console.error("[ERROR] Failed to copy encrypted text:", error));
}

// Decrypt selected text
function handleDecryption(text) {
    if (!text) return;
    let passphrase = prompt("Enter decryption passphrase:", "mypassword");
    if (!passphrase) return;

    try {
        const decrypted = CryptoJS.AES.decrypt(text, passphrase).toString(CryptoJS.enc.Utf8);
        if (!decrypted) throw new Error("Decryption failed");
        alert(`Decrypted Text: ${decrypted}`);
    } catch (error) {
        console.error("[ERROR] Decryption failed:", error);
        alert("Decryption failed. Check your passphrase.");
    }
}
