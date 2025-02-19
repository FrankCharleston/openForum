chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "decryptText",
        title: "Decrypt Message",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "decryptText") {
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
        const passphrase = "your-secret-passphrase"; // Change this!
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
