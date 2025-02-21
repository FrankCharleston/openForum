// background.js - Manages encryption, decryption, auto-decryption, and UI interactions

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
    
    chrome.contextMenus.create({
        id: "toggleAutoDecrypt",
        title: "Toggle Auto-Decryption",
        contexts: ["action"]
    });
    
    chrome.contextMenus.create({
        id: "viewDecryptionErrors",
        title: "View Decryption Errors",
        contexts: ["action"]
    });
    
    chrome.contextMenus.create({
        id: "clearDecryptionErrors",
        title: "Clear Decryption Errors",
        contexts: ["action"]
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
    if (info.menuItemId === "toggleAutoDecrypt") {
        chrome.storage.local.get("autoDecrypt", (data) => {
            let newState = !data.autoDecrypt;
            chrome.storage.local.set({ autoDecrypt: newState });
            chrome.action.setBadgeText({ text: newState ? "ON" : "OFF" });
            chrome.action.setBadgeBackgroundColor({ color: newState ? "#4CAF50" : "#F44336" });
            chrome.notifications.create({
                type: "basic",
                iconUrl: "icon.png",
                title: "Auto-Decryption",
                message: `Auto-Decryption is now ${newState ? "Enabled" : "Disabled"}`
            });
        });
    }
    if (info.menuItemId === "viewDecryptionErrors") {
        chrome.tabs.create({ url: "errors.html" });
    }
    if (info.menuItemId === "clearDecryptionErrors") {
        chrome.storage.local.set({ decryptionErrors: [] }, () => {
            alert("Decryption error log cleared.");
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
    chrome.storage.local.get("defaultPassphrase", (data) => {
        let passphrase = data.defaultPassphrase || prompt("Enter passphrase to decrypt:");
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
            console.error("Decryption failed:", error);
            chrome.storage.local.get("decryptionErrors", (data) => {
                let errors = data.decryptionErrors || [];
                errors.push({ timestamp: new Date().toISOString(), error: error.message });
                chrome.storage.local.set({ decryptionErrors: errors });
            });
            alert("Decryption error. Ensure the text is correctly formatted.");
        }
    });
}
