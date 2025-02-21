// background.js - Enhancing Right Click Context Menu for Encryption
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "encryptText",
        title: "Encrypt Selected Text",
        contexts: ["selection"]
    });
    
    chrome.contextMenus.create({
        id: "decryptText",
        title: "Decrypt Selected Text",
        contexts: ["selection"]
    });

    console.log("[INFO] Context menus created.");
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "encryptText") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: encryptSelectedText,
            args: [info.selectionText]
        });
    }
    if (info.menuItemId === "decryptText") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: decryptSelectedText,
            args: [info.selectionText]
        });
    }
});

function encryptSelectedText(text) {
    let passphrase = prompt("Enter passphrase to encrypt:");
    if (!passphrase || !text.trim()) return;

    try {
        let encrypted = CryptoJS.AES.encrypt(text.trim(), passphrase).toString();
        let formattedMessage = `ENC[${encrypted}]\n\n🔐 This message is securely encrypted using OpenForum. Join the discussion securely!`;
        
        navigator.clipboard.writeText(formattedMessage).then(() => {
            alert("✅ Encrypted text copied to clipboard.");
        }).catch(() => {
            alert("❌ Failed to copy to clipboard.");
        });

    } catch (error) {
        console.error("Encryption error:", error);
        alert("Encryption failed.");
    }
}

function decryptSelectedText(text) {
    let passphrase = prompt("Enter passphrase to decrypt:");
    if (!passphrase || !text.startsWith("ENC[")) return;

    try {
        let encryptedData = text.replace("ENC[", "").replace("]", "").trim();
        let bytes = CryptoJS.AES.decrypt(encryptedData, passphrase);
        let decrypted = bytes.toString(CryptoJS.enc.Utf8);

        if (decrypted) {
            alert("✅ Decrypted Text: " + decrypted);
        } else {
            alert("❌ Decryption failed. Incorrect passphrase or corrupted data.");
        }
    } catch (error) {
        console.error("Decryption error:", error);
        alert("Decryption failed.");
    }
}
