// background.js - Handles right-click menu and clipboard actions

// Ensure the context menu is set up when the extension installs or updates
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "encryptMessage",
        title: "Encrypt Message",
        contexts: ["selection"]
    });

    chrome.contextMenus.create({
        id: "decryptMessage",
        title: "Decrypt Message",
        contexts: ["selection"]
    });

    chrome.contextMenus.create({
        id: "decryptPage",
        title: "Decrypt Entire Page",
        contexts: ["all"]
    });

    chrome.contextMenus.create({
        id: "decryptClipboard",
        title: "Decrypt Clipboard",
        contexts: ["all"]
    });
});

// Handle right-click context menu actions
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    try {
        if (info.menuItemId === "encryptMessage") {
            let encryptedText = await encryptMessage(info.selectionText);
            await navigator.clipboard.writeText(encryptedText);
            sendLogToPopup(`✅ Message encrypted and copied to clipboard.`);
        } else if (info.menuItemId === "decryptMessage") {
            let decryptedText = await decryptMessage(info.selectionText);
            sendLogToPopup(`✅ Decrypted Message: ${decryptedText}`);
        } else if (info.menuItemId === "decryptPage") {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: decryptAllOnPage
            });
        } else if (info.menuItemId === "decryptClipboard") {
            let clipboardText = await navigator.clipboard.readText();
            let decryptedText = await decryptMessage(clipboardText);
            sendLogToPopup(`✅ Clipboard Decryption: ${decryptedText}`);
        }
    } catch (error) {
        sendLogToPopup(`❌ Error: ${error.message}`, "error");
    }
});

// Encrypt a message
async function encryptMessage(text, passphrase = "defaultpassword") {
    try {
        let encrypted = CryptoJS.AES.encrypt(text, passphrase).toString();
        return `ENC[${encrypted}]`;
    } catch (error) {
        sendLogToPopup(`❌ Encryption failed: ${error.message}`, "error");
        return null;
    }
}

// Decrypt a message
async function decryptMessage(encryptedText, passphrase = "defaultpassword") {
    try {
        let decrypted = CryptoJS.AES.decrypt(encryptedText.replace("ENC[", "").replace("]", ""), passphrase).toString(CryptoJS.enc.Utf8);
        if (!decrypted) throw new Error("Invalid passphrase or corrupted data.");
        return decrypted;
    } catch (error) {
        sendLogToPopup(`❌ Decryption failed: ${error.message}`, "error");
        return null;
    }
}

// Function to send logs to the popup UI
function sendLogToPopup(message, type = "log") {
    chrome.runtime.sendMessage({ type, content: message });
}

// Injected script to scan & decrypt all encrypted messages on a page
function decryptAllOnPage() {
    let elements = document.querySelectorAll("*:not(script):not(style)");
    elements.forEach(el => {
        if (el.textContent.includes("ENC[")) {
            let decrypted = decryptMessage(el.textContent);
            if (decrypted) el.textContent = decrypted;
        }
    });
}
