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
    if (info.menuItemId === "decryptSelection" && info.selectionText) {
        console.log("[DEBUG] Decrypting selected text:", info.selectionText);
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: decryptText,
            args: [info.selectionText]
        });
    }
    if (info.menuItemId === "decryptClipboard") {
        try {
            const clipboardText = await navigator.clipboard.readText();
            console.log("[DEBUG] Clipboard data:", clipboardText);
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: decryptText,
                args: [clipboardText]
            });
        } catch (error) {
            console.error("[ERROR] Failed to read clipboard:", error);
            chrome.notifications.create({
                type: "basic",
                iconUrl: "icon.png",
                title: "Clipboard Error",
                message: "Failed to access clipboard data."
            });
        }
    }
});

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
