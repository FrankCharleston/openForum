chrome.runtime.onInstalled.addListener(() => {
    console.log("[DEBUG] Background script installed");

    // Create a right-click context menu for decryption
    chrome.contextMenus.create(
        {
            id: "decryptText",
            title: "Decrypt Message",
            contexts: ["selection"]
        },
        () => {
            if (chrome.runtime.lastError) {
                console.error("[ERROR] Context menu creation failed:", chrome.runtime.lastError.message);
            } else {
                console.log("[DEBUG] Context menu created successfully.");
            }
        }
    );
});

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

function decryptSelectedText(selectedText) {
    try {
        if (!selectedText.startsWith("ENC[")) {
            alert("No encrypted message detected.");
            return;
        }

        const encryptedText = selectedText.replace(/ENC\[|\]/g, "");
        let passphrase = prompt("Enter decryption passphrase:", "mypassword");
        if (!passphrase) passphrase = "mypassword";

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
