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
}, () => {
    if (chrome.runtime.lastError) {
        console.error("[ERROR] Context menu creation failed:", chrome.runtime.lastError);
    } else {
        console.log("[DEBUG] Context menu created successfully.");
    }
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
    if (!selectedText) {
        console.warn("[WARN] No text selected for decryption.");
        return;
    }

    let passphrase = prompt("Enter decryption passphrase (or cancel to exit):", "mypassword");
    if (passphrase === null) {
        console.log("[DEBUG] Decryption canceled by user.");
        return;
    }

    console.log("[DEBUG] Attempting to decrypt selected text:", selectedText);

    try {
        if (!selectedText.startsWith("U2FsdGVk")) {
            console.warn("[WARN] Unrecognized encryption format.");
            alert("⚠️ Unrecognized encryption format. Ensure it's OpenSSL AES-256-CBC.");
            return;
        }

        const rawData = CryptoJS.enc.Base64.parse(selectedText.substring(8));
        const salt = CryptoJS.lib.WordArray.create(rawData.words.slice(0, 2));
        const ciphertext = CryptoJS.lib.WordArray.create(rawData.words.slice(2));

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
            navigator.clipboard.writeText(plainText).then(() => {
                console.log("[DEBUG] Decrypted text copied to clipboard.");
            }).catch(err => {
                console.error("[ERROR] Failed to copy decrypted text to clipboard:", err);
            });
        } else {
            console.warn("[WARN] Decryption failed. Possible incorrect passphrase or corrupted input.");
            alert("Failed to decrypt: Incorrect passphrase or corrupted input");
        }
    } catch (e) {
        console.error("[ERROR] Decryption error:", e);
        alert("⚠️ Error decrypting message: " + e.message);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (typeof redditOverlay !== "undefined" && typeof redditOverlay.init === "function") {
        redditOverlay.init();
    } else {
        console.error("[ERROR] redditOverlay is not defined or missing init function.");
    }
});
