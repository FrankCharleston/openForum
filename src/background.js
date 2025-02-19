/* ==============================
   📌 background.js - Manages Context Menu & Clipboard
   ============================== */

// Create a right-click context menu
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "decryptSelection",
        title: "Decrypt Selected Text",
        contexts: ["selection"]
    });

    chrome.contextMenus.create({
        id: "decryptClipboard",
        title: "Decrypt Clipboard",
        contexts: ["all"]
    });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "decryptClipboard") {
        try {
            // Request clipboard permissions before reading clipboard data
            await navigator.permissions.query({ name: "clipboard-read" });

            const clipboardText = await navigator.clipboard.readText();
            console.log("[DEBUG] Clipboard data:", clipboardText);

            if (!clipboardText.startsWith("ENC[")) {
                console.warn("[WARN] No encrypted message detected in clipboard.");
                sendLogToPopup("⚠️ No encrypted message detected in clipboard.", "warn");
                return;
            }

            const encryptedText = clipboardText.replace(/ENC\[|\]/g, "");
            decryptClipboardText(encryptedText);
        } catch (error) {
            console.error("[ERROR] Failed to read clipboard:", error);
            sendLogToPopup("⚠️ Error accessing clipboard data.", "error");
        }
    }
});

// Function to send logs to the popup
function sendLogToPopup(message, type = "log") {
    chrome.runtime.sendMessage({ type, content: message });
}

// Function to decrypt text
function decryptText(encryptedText) {
    if (!encryptedText.startsWith("ENC[")) {
        chrome.notifications.create({
            type: "basic",
            iconUrl: "icon.png",
            title: "Decryption Error",
            message: "No encrypted message detected."
        });
        return;
    }

    let passphrase = prompt("Enter decryption passphrase:", "mypassword");
    if (!passphrase) return;

    try {
        console.log("[DEBUG] Attempting decryption...");
        const encryptedData = encryptedText.replace(/ENC\[|\]/g, "");
        const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, passphrase);
        const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

        if (decryptedText) {
            chrome.notifications.create({
                type: "basic",
                iconUrl: "icon.png",
                title: "Decryption Successful",
                message: decryptedText
            });
            navigator.clipboard.writeText(decryptedText);
        } else {
            chrome.notifications.create({
                type: "basic",
                iconUrl: "icon.png",
                title: "Decryption Failed",
                message: "Incorrect passphrase or corrupted input."
            });
        }
    } catch (error) {
        console.error("[ERROR] Decryption failed:", error);
        chrome.notifications.create({
            type: "basic",
            iconUrl: "icon.png",
            title: "Decryption Error",
            message: "Error decrypting message: " + error.message
        });
    }
}
