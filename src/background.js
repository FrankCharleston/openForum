chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "decryptClipboard") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: requestDecryption
        });
    }
});

function requestDecryption() {
    let passphrase = prompt("Enter decryption passphrase:");
    if (!passphrase) return;

    navigator.clipboard.readText().then(text => {
        if (!text.startsWith("ENC[")) {
            alert("No encrypted message detected in clipboard.");
            return;
        }

        let encryptedText = text.replace(/ENC\[|\]/g, "");
        chrome.runtime.sendMessage({ type: "decrypt", encryptedText, passphrase });
    }).catch(err => console.error("[ERROR] Failed to read clipboard:", err));
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "decrypt") {
        try {
            let decryptedBytes = CryptoJS.AES.decrypt(request.encryptedText, request.passphrase);
            let decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

            if (!decryptedText) throw new Error("Decryption failed.");

            navigator.clipboard.writeText(decryptedText).then(() => {
                console.log("[SUCCESS] Decrypted text copied to clipboard.");
            });
        } catch (error) {
            console.error("[ERROR] Decryption failed:", error);
        }
    }
});
