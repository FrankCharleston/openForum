chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "decryptClipboard",
        title: "Decrypt Clipboard",
        contexts: ["all"]
    });

    chrome.contextMenus.create({
        id: "decryptSelection",
        title: "Decrypt Selected Text",
        contexts: ["selection"]
    });
});

// Handle right-click actions
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "decryptClipboard") {
        handleClipboardDecryption();
    } else if (info.menuItemId === "decryptSelection") {
        decryptText(info.selectionText);
    }
});

// Function to decrypt clipboard contents
async function handleClipboardDecryption() {
    try {
        const clipboardText = await navigator.clipboard.readText();
        console.log("[DEBUG] Clipboard data:", clipboardText);

        if (!clipboardText.startsWith("ENC[")) {
            sendNotification("Decryption Failed", "No encrypted message detected in clipboard.");
            return;
        }

        const encryptedText = clipboardText.replace(/ENC\[|\]/g, "");
        decryptText(encryptedText);
    } catch (error) {
        console.error("[ERROR] Failed to read clipboard:", error);
    }
}

// Function to decrypt text
function decryptText(encryptedText) {
    let passphrase = prompt("Enter decryption passphrase:", "mypassword");
    if (!passphrase) {
        console.log("[DEBUG] Decryption canceled by user.");
        return;
    }

    try {
        console.log("[DEBUG] Attempting to decrypt...");
        const decryptedMessage = tryDecrypt(encryptedText, passphrase);

        if (decryptedMessage) {
            navigator.clipboard.writeText(decryptedMessage);
            sendNotification("Decryption Successful", "Decrypted text copied to clipboard!");
        } else {
            sendNotification("Decryption Failed", "Incorrect passphrase or corrupted data.");
        }
    } catch (error) {
        console.error("[ERROR] Decryption failed:", error);
    }
}

// Generic decryption function
function tryDecrypt(encryptedText, passphrase) {
    try {
        if (!encryptedText.startsWith("U2FsdGVk")) {
            console.warn("[WARN] Unrecognized encryption format.");
            return null;
        }

        const decryptedBytes = CryptoJS.AES.decrypt(encryptedText, passphrase);
        const plainText = decryptedBytes.toString(CryptoJS.enc.Utf8);
        return plainText || null;
    } catch (error) {
        console.error("[ERROR] Decryption error:", error);
        return null;
    }
}

// Send browser notification
function sendNotification(title, message) {
    chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: title,
        message: message
    });
}
