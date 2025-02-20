console.log("[INFO] OpenForum background service worker started.");

// Ensure the context menu is created on extension install
chrome.runtime.onInstalled.addListener(() => {
    console.log("[INFO] Extension installed. Creating context menu...");

    chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
            id: "encryptText",
            title: "🔐 Encrypt Selected Text",
            contexts: ["selection"]
        });

        chrome.contextMenus.create({
            id: "decryptText",
            title: "🔓 Decrypt Selected Text",
            contexts: ["selection"]
        });

        chrome.contextMenus.create({
            id: "decryptClipboard",
            title: "📋 Decrypt Clipboard",
            contexts: ["all"]
        });

        console.log("[INFO] Context menus created successfully.");
    });
});

// Handle context menu actions
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "encryptText") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: encryptSelectedText,
            args: [info.selectionText]
        });
    } else if (info.menuItemId === "decryptText") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: decryptSelectedText,
            args: [info.selectionText]
        });
    } else if (info.menuItemId === "decryptClipboard") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: decryptClipboardContent
        });
    }
});

// Ensure clipboard permissions before reading
async function decryptClipboardContent() {
    try {
        const text = await navigator.clipboard.readText();
        console.log("[INFO] Clipboard content received:", text);
    } catch (error) {
        console.error("[ERROR] Clipboard read failed:", error);
    }
}


// // Ensure the context menu is created when the extension is installed or updated
// chrome.runtime.onInstalled.addListener(() => {
//     console.log("[INFO] OpenForum installed. Creating context menus...");

//     // Remove existing menu items to prevent duplicates
//     chrome.contextMenus.removeAll(() => {
//         // Create context menu items
//         chrome.contextMenus.create({
//             id: "encryptText",
//             title: "🔐 Encrypt Selected Text",
//             contexts: ["selection"]
//         });

//         chrome.contextMenus.create({
//             id: "decryptText",
//             title: "🔓 Decrypt Selected Text",
//             contexts: ["selection"]
//         });

//         chrome.contextMenus.create({
//             id: "decryptClipboard",
//             title: "📋 Decrypt Clipboard",
//             contexts: ["all"]
//         });

//         console.log("[INFO] Context menus created successfully.");
//     });
// });

// // Listen for context menu clicks
// chrome.contextMenus.onClicked.addListener((info, tab) => {
//     if (info.menuItemId === "encryptText") {
//         encryptSelectedText(info.selectionText);
//     } else if (info.menuItemId === "decryptText") {
//         decryptSelectedText(info.selectionText);
//     } else if (info.menuItemId === "decryptClipboard") {
//         decryptClipboardContent();
//     }
// });

// // Encrypt selected text
// function encryptSelectedText(selectedText) {
//     let passphrase = prompt("Enter encryption passphrase:");
//     if (!passphrase) return;

//     try {
//         let encrypted = CryptoJS.AES.encrypt(selectedText, passphrase).toString();
//         let encryptedMessage = `ENC[${encrypted}]`;

//         navigator.clipboard.writeText(encryptedMessage).then(() => {
//             console.log("[SUCCESS] Encrypted text copied to clipboard.");
//             showNotification("✅ Encryption Success", "Text copied to clipboard.");
//         }).catch(err => console.error("[ERROR] Failed to copy:", err));
//     } catch (error) {
//         console.error("[ERROR] Encryption failed:", error);
//         showNotification("⚠️ Encryption Failed", "An error occurred.");
//     }
// }

// // Decrypt selected text
// function decryptSelectedText(encryptedText) {
//     let passphrase = prompt("Enter decryption passphrase:");
//     if (!passphrase) return;

//     if (!encryptedText.startsWith("ENC[")) {
//         showNotification("⚠️ Invalid Format", "Not a valid encrypted message.");
//         return;
//     }

//     try {
//         let encryptedData = encryptedText.replace("ENC[", "").replace("]", "");
//         let decryptedBytes = CryptoJS.AES.decrypt(encryptedData, passphrase);
//         let decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

//         if (!decryptedText) throw new Error("Decryption failed.");

//         navigator.clipboard.writeText(decryptedText).then(() => {
//             console.log("[SUCCESS] Decrypted text copied to clipboard.");
//             showNotification("✅ Decryption Success", decryptedText);
//         }).catch(err => console.error("[ERROR] Failed to copy:", err));
//     } catch (error) {
//         console.error("[ERROR] Decryption failed:", error);
//         showNotification("⚠️ Decryption Failed", "Check your passphrase.");
//     }
// }

// // Decrypt clipboard content
// function decryptClipboardContent() {
//     let passphrase = prompt("Enter decryption passphrase:");
//     if (!passphrase) return;

//     navigator.clipboard.readText().then(text => {
//         if (!text.startsWith("ENC[")) {
//             showNotification("⚠️ No Encrypted Data", "Clipboard does not contain an encrypted message.");
//             return;
//         }

//         let encryptedText = text.replace("ENC[", "").replace("]", "");
//         try {
//             let decryptedBytes = CryptoJS.AES.decrypt(encryptedText, passphrase);
//             let decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

//             if (!decryptedText) throw new Error("Decryption failed.");

//             navigator.clipboard.writeText(decryptedText).then(() => {
//                 console.log("[SUCCESS] Decrypted clipboard text copied.");
//                 showNotification("✅ Clipboard Decryption", decryptedText);
//             }).catch(err => console.error("[ERROR] Failed to copy:", err));
//         } catch (error) {
//             console.error("[ERROR] Decryption failed:", error);
//             showNotification("⚠️ Decryption Failed", "Check your passphrase.");
//         }
//     }).catch(err => console.error("[ERROR] Failed to read clipboard:", err));
// }

// // Show a notification for success/error messages
// function showNotification(title, message) {
//     chrome.notifications.create({
//         type: "basic",
//         iconUrl: "icons/icon.png",
//         title: title,
//         message: message,
//         priority: 2
//     });
// }
