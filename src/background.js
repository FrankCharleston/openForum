chrome.runtime.onInstalled.addListener(() => {
    console.log("[DEBUG] Background script installed");

    // Create a right-click context menu
    chrome.contextMenus.create({
        id: "decryptText",
        title: "Decrypt Message",
        contexts: ["selection"]
    });
});

// Ensure the onClicked event is properly registered
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "decryptText") {
        console.log("[DEBUG] Context menu clicked:", info.selectionText);
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: decryptSelectedText,
            args: [info.selectionText]
        });
    }
});

// Function to decrypt selected text
function decryptSelectedText(selectedText) {
    try {
        if (!selectedText.startsWith("ENC[")) {
            alert("No encrypted message detected.");
            return;
        }

        const encryptedText = selectedText.replace(/ENC\[|\]/g, "");
        const passphrase = "mypassword"; // Change this!
        const decrypted = CryptoJS.AES.decrypt(encryptedText, passphrase);
        const plainText = decrypted.toString(CryptoJS.enc.Utf8);

        if (plainText) {
            alert("Decrypted Message: " + plainText);
        } else {
            alert("Failed to decrypt message.");
        }
    } catch (e) {
        alert("Error decrypting message.");
        console.error("[ERROR] Decryption error:", e);
    }
}
