// Ensure the service worker starts
console.log("[INFO] OpenForum background service worker started.");

// Wait for the extension to install or update
chrome.runtime.onInstalled.addListener(() => {
    console.log("[INFO] OpenForum installed, setting up context menus.");
    
    // Create context menu items
    chrome.contextMenus.create({
        id: "encryptSelectedText",
        title: "Encrypt Selected Text",
        contexts: ["selection"]
    });

    chrome.contextMenus.create({
        id: "decryptSelectedText",
        title: "Decrypt Selected Text",
        contexts: ["selection"]
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

                try {
                    let encryptedData = selectedText.replace("ENC[", "").replace("]", "");
                    let decryptedBytes = CryptoJS.AES.decrypt(encryptedData, passphrase);
                    let decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

                    if (!decryptedText) throw new Error("Invalid decryption.");

                    navigator.clipboard.writeText(decryptedText);
                    alert("Decrypted text copied to clipboard.");
                } catch (error) {
                    alert("Decryption failed.");
                }
            },
            args: [info.selectionText]
        });
    }
});
