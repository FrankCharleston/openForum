// Ensure the service worker starts
console.log("[INFO] OpenForum background service worker started.");

// Check if the runtime API exists before calling it
if (chrome.runtime && chrome.runtime.onInstalled) {
    chrome.runtime.onInstalled.addListener(() => {
        console.log("[INFO] OpenForum installed, setting up context menus.");

        // Remove existing context menu items to avoid duplication
        chrome.contextMenus.removeAll(() => {
            console.log("[INFO] Old context menus cleared.");

            // Create "Encrypt Selected Text" menu item
            chrome.contextMenus.create({
                id: "encryptSelectedText",
                title: "Encrypt Selected Text",
                contexts: ["selection"]
            });

            // Create "Decrypt Selected Text" menu item
            chrome.contextMenus.create({
                id: "decryptSelectedText",
                title: "Decrypt Selected Text",
                contexts: ["selection"]
            });

            console.log("[INFO] Context menus created successfully.");
        });
    });

    // Handle context menu clicks
    chrome.contextMenus.onClicked.addListener((info, tab) => {
        console.log("[DEBUG] Context menu clicked:", info.menuItemId, "Text:", info.selectionText);

        if (info.menuItemId === "encryptSelectedText") {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (selectedText) => {
                    let passphrase = prompt("Enter passphrase:");
                    if (!passphrase) return;
                    let encrypted = CryptoJS.AES.encrypt(selectedText, passphrase).toString();
                    navigator.clipboard.writeText(`ENC[${encrypted}]`);
                    alert("Encrypted text copied to clipboard.");
                },
                args: [info.selectionText]
            });
        }

        if (info.menuItemId === "decryptSelectedText") {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (selectedText) => {
                    let passphrase = prompt("Enter passphrase:");
                    if (!passphrase) return;
                    let decryptedText = decryptOpenSSL(selectedText, passphrase);
                    navigator.clipboard.writeText(decryptedText);
                    alert("Decrypted text copied to clipboard.");
                },
                args: [info.selectionText]
            });
        }
    });
} else {
    console.error("[ERROR] chrome.runtime API is undefined. Background script might not be loading.");
}
