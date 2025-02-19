chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({ id: "encryptMessage", title: "Encrypt Message", contexts: ["selection"] });
    chrome.contextMenus.create({ id: "decryptMessage", title: "Decrypt Message", contexts: ["selection"] });
    chrome.contextMenus.create({ id: "decryptClipboard", title: "Decrypt Clipboard", contexts: ["all"] });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "encryptMessage") {
        const selectedText = info.selectionText;
        if (!selectedText) return;

        let passphrase = prompt("Enter encryption passphrase:", "mypassword");
        if (!passphrase) return;

        const encryptedText = encryptText(selectedText, passphrase);
        navigator.clipboard.writeText(`ENC[${encryptedText}]`).then(() => {
            alert("Encrypted text copied to clipboard.");
        });
    }

    if (info.menuItemId === "decryptMessage") {
        const selectedText = info.selectionText;
        if (!selectedText) return;

        let passphrase = prompt("Enter decryption passphrase:", "mypassword");
        if (!passphrase) return;

        const decryptedText = decryptText(selectedText.replace(/ENC\[|\]/g, ""), passphrase);
        alert(`Decrypted Text: ${decryptedText}`);
    }

    if (info.menuItemId === "decryptClipboard") {
        try {
            const clipboardText = await navigator.clipboard.readText();
            if (!clipboardText.startsWith("ENC[")) {
                alert("No encrypted message detected in clipboard.");
                return;
            }

            let passphrase = prompt("Enter decryption passphrase:", "mypassword");
            if (!passphrase) return;

            const decryptedText = decryptText(clipboardText.replace(/ENC\[|\]/g, ""), passphrase);
            alert(`Decrypted Clipboard Text: ${decryptedText}`);
        } catch (error) {
            console.error("[ERROR] Failed to read clipboard:", error);
            alert("Error accessing clipboard data.");
        }
    }
});

function encryptText(text, passphrase) {
    return CryptoJS.AES.encrypt(text, passphrase).toString();
}

function decryptText(encryptedText, passphrase) {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, passphrase);
    return decrypted.toString(CryptoJS.enc.Utf8) || "⚠️ Decryption failed";
}
