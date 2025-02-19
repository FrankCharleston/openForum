chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({ id: "encrypt", title: "Encrypt Text", contexts: ["selection"] });
    chrome.contextMenus.create({ id: "decrypt", title: "Decrypt Text", contexts: ["selection"] });
    chrome.contextMenus.create({ id: "decryptPage", title: "Decrypt Page", contexts: ["page"] });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "encrypt") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: encryptSelectedText
        });
    } else if (info.menuItemId === "decrypt") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: decryptSelectedText
        });
    } else if (info.menuItemId === "decryptPage") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: decryptEntirePage
        });
    }
});

function encryptSelectedText() {
    let text = window.getSelection().toString();
    if (!text) {
        alert("No text selected.");
        return;
    }
    let passphrase = prompt("Enter passphrase for encryption:");
    if (!passphrase) return;

    let encrypted = CryptoJS.AES.encrypt(text, passphrase).toString();
    navigator.clipboard.writeText(`ENC[${encrypted}]`).then(() => {
        alert("Encrypted text copied to clipboard.");
    });
}

function decryptSelectedText() {
    let text = window.getSelection().toString();
    if (!text.startsWith("ENC[")) {
        alert("No encrypted message detected.");
        return;
    }
    let passphrase = prompt("Enter passphrase for decryption:");
    if (!passphrase) return;

    let encryptedText = text.replace(/^ENC\[(.+)\]$/, "$1");
    let bytes = CryptoJS.AES.decrypt(encryptedText, passphrase);
    let decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
        alert("Failed to decrypt. Check your passphrase.");
        return;
    }

    navigator.clipboard.writeText(decrypted).then(() => {
        alert("Decrypted text copied to clipboard.");
    });
}

function decryptEntirePage() {
    let passphrase = prompt("Enter passphrase to decrypt all messages:");
    if (!passphrase) return;

    let elements = document.querySelectorAll("*:not(script):not(style)");
    elements.forEach((el) => {
        if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
            let text = el.textContent.trim();
            if (text.startsWith("ENC[")) {
                let encryptedText = text.replace(/^ENC\[(.+)\]$/, "$1");
                let bytes = CryptoJS.AES.decrypt(encryptedText, passphrase);
                let decrypted = bytes.toString(CryptoJS.enc.Utf8);
                if (decrypted) el.textContent = decrypted;
            }
        }
    });
}
