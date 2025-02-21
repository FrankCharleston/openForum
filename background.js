// background.js - Enhancing Right Click Context Menu for Encryption and Decryption
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
    if (!text || text.trim() === "") {
        alert("No text selected for encryption.");
        return;
    }
    let passphrase = prompt("Enter passphrase to encrypt:");
    if (!passphrase) return;
    let encrypted = CryptoJS.AES.encrypt(text.trim(), passphrase).toString();
    let formattedMessage = `ENC[${encrypted}]

🔐 Securely encrypted with OpenForum`;
    navigator.clipboard.writeText(formattedMessage).then(() => {
        alert("Encrypted text copied to clipboard.");
    }).catch(() => {
        alert("Failed to copy encrypted text.");
    });
}

function decryptSelectedText(text) {
    if (!text || !text.startsWith("ENC[")) {
        alert("No valid encrypted text selected.");
        return;
    }
    let passphrase = prompt("Enter passphrase to decrypt:");
    if (!passphrase) return;
    try {
        let encryptedData = text.replace("ENC[", "").replace("]", "").trim();
        let bytes = CryptoJS.AES.decrypt(encryptedData, passphrase);
        let decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (decrypted) {
            alert("Decrypted Text: " + decrypted);
        } else {
            alert("Decryption failed. Incorrect passphrase or corrupted data.");
        }
    } catch (error) {
        alert("Decryption error. Ensure the text is correctly formatted.");
    }
}
