chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("[DEBUG] Received message from popup:", message);

    if (message.action === "toggleDecryption") {
        console.log("[DEBUG] Toggling decryption process...");
        redditOverlay.scanAndDecrypt();
        sendResponse({ status: "Decryption triggered" });
    } else {
        console.warn("[WARN] Unknown message received:", message);
    }
});

chrome.contextMenus.create({
    id: "decryptSelection",
    title: "Decrypt Selected Text",
    contexts: ["selection"]
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "decryptSelection") {
        console.log("[DEBUG] Context menu clicked with text:", info.selectionText);
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: decryptSelectedText,
            args: [info.selectionText]
        });
    }
});

function decryptSelectedText(selectedText) {
    let passphrase = prompt("Enter decryption passphrase (or cancel to exit):", "mypassword");
    if (passphrase === null) {
        console.log("[DEBUG] Decryption canceled by user.");
        return;
    }

    console.log("[DEBUG] Attempting to decrypt selected text:", selectedText);

    try {
        const rawData = CryptoJS.enc.Base64.parse(selectedText);
        const rawBytes = rawData.words;

        if (selectedText.startsWith("U2FsdGVk")) {
            console.log("[DEBUG] OpenSSL format detected.");
            const salt = CryptoJS.enc.Base64.parse(selectedText.substring(16, 24));
            const ciphertext = CryptoJS.enc.Base64.parse(selectedText.substring(24));

            const keySize = 256 / 32;
            const ivSize = 128 / 32;
            const derivedKey = CryptoJS.PBKDF2(passphrase, salt, {
                keySize: keySize + ivSize,
                iterations: 10000,
                hasher: CryptoJS.algo.SHA256
            });

            const key = CryptoJS.lib.WordArray.create(derivedKey.words.slice(0, keySize));
            const iv = CryptoJS.lib.WordArray.create(derivedKey.words.slice(keySize));

            const decrypted = CryptoJS.AES.decrypt({ ciphertext: ciphertext }, key, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });

            const plainText = decrypted.toString(CryptoJS.enc.Utf8);
            if (plainText && plainText.trim() !== "") {
                console.log("[DEBUG] Successfully decrypted:", plainText);
                alert("Decrypted Message: " + plainText);
            } else {
                console.warn("[WARN] Decryption failed. Possible incorrect passphrase or corrupted input.");
                alert("Failed to decrypt: Incorrect passphrase or corrupted input");
            }
        } else {
            console.warn("[WARN] Unrecognized encryption format.");
            alert("⚠️ Unrecognized encryption format. Ensure it's OpenSSL AES-256-CBC.");
        }
    } catch (e) {
        console.error("[ERROR] Decryption error:", e);
        alert("⚠️ Error decrypting message: " + e.message);
    }
}

document.addEventListener("DOMContentLoaded", () => redditOverlay.init());
